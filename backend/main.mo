import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Char "mo:core/Char";
import Error "mo:core/Error";

import MixinStorage "blob-storage/Mixin";


actor {
  include MixinStorage();

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    image : ?Text;
  };

  type Category = {
    name : Text;
    description : Text;
    image : ?Text;
  };

  type CheckoutLineItem = {
    product_id : Nat;
    quantity : Nat;
  };

  type Status = {
    #checking : { userPrincipal : ?Text };
    #failed : { error : Text; userPrincipal : ?Text };
    #completed : { response : Text; userPrincipal : ?Text };
  };

  type PaginationResult<T> = {
    items : [T];
    total_items : Nat;
    total_pages : Nat;
    current_page : Nat;
    has_next_page : Bool;
    has_prev_page : Bool;
  };

  var authorization = "";
  var nonce = 0;
  var nextProductId : Nat = 1;

  let products = Map.empty<Nat, Product>();
  var categories : Map.Map<Text, Category> = Map.empty<Text, Category>();
  let transactions = Map.empty<Text, Status>();
  let userProfiles = Map.empty<Principal, Text>();
  let adminPrincipals = List.empty<Principal>();
  var allowedOrigins = List.empty<Text>();

  let ic = actor ("aaaaa-aa") : actor {
    http_request : ({
      url : Text;
      max_response_bytes : ?Nat;
      headers : [{ name : Text; value : Text }];
      body : ?Blob;
      method : { #get; #post };
      transform : ?{
        function : shared query ({
          response : {
            status : Nat;
            headers : [{ name : Text; value : Text }];
            body : Blob;
          };
        }) -> async {
          status : Nat;
          headers : [{ name : Text; value : Text }];
          body : Blob;
        };
        context : Blob;
      };
    }) -> async {
      status : Nat;
      headers : [{ name : Text; value : Text }];
      body : Blob;
    };
  };

  func requireAdmin(caller : Principal) {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Admin access required");
    };
  };

  func hasAdminPermission(caller : Principal) : Bool {
    adminPrincipals.contains(caller);
  };

  func paginateArray<T>(items : [T], page : Nat, limit : Nat) : PaginationResult<T> {
    let total_items = items.size();
    let safeLimit = if (limit == 0) { 1 } else { limit };
    let totalLimit = safeLimit;
    let total_pages = if (total_items == 0 or totalLimit == 0) { 1 } else {
      ((total_items + totalLimit - 1) : Int / totalLimit : Int).toNat();
    };
    let current_page = Nat.min(Nat.max(page, 1), total_pages);
    let startIndex = if (current_page > 0) { (current_page - 1) * totalLimit } else {
      0;
    };
    let endIndex = Nat.min(startIndex + totalLimit, total_items);
    let sliceLength = if (endIndex > startIndex) { endIndex - startIndex } else { 0 };

    {
      items = if (startIndex >= total_items) { [] } else {
        items.sliceToArray(startIndex, sliceLength);
      };
      total_items;
      total_pages;
      current_page;
      has_next_page = current_page < total_pages;
      has_prev_page = current_page > 1;
    };
  };

  func validatePagination(page : ?Nat, limit : ?Nat) : (Nat, Nat) {
    let validatedPage = switch (page) {
      case (?p) {
        if (p == 0) { Runtime.trap("Page must be greater than 0") };
        if (p > 10000) { Runtime.trap("Page number too large (max 10000)") };
        p;
      };
      case (null) { 1 };
    };
    let validatedLimit = switch (limit) {
      case (?l) {
        if (l == 0) { Runtime.trap("Limit must be greater than 0") };
        if (l > 100) { Runtime.trap("Limit too large (max 100)") };
        l;
      };
      case (null) { 10 };
    };
    (validatedPage, validatedLimit);
  };

  public shared ({ caller }) func initializeAuth() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot be admin");
    };
    if (adminPrincipals.isEmpty()) { adminPrincipals.add(caller) };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    hasAdminPermission(caller);
  };

  public shared ({ caller }) func addAdmin(newAdmin : Principal) : async () {
    requireAdmin(caller);
    if (newAdmin.isAnonymous()) {
      Runtime.trap("Cannot add anonymous principal as admin");
    };
    if (adminPrincipals.contains(newAdmin)) {
      Runtime.trap("Principal is already an admin");
    };
    adminPrincipals.add(newAdmin);
  };

  public shared ({ caller }) func removeAdmin(adminToRemove : Principal) : async () {
    requireAdmin(caller);

    if (adminPrincipals.size() <= 1) {
      Runtime.trap("Cannot remove the last admin");
    };
    if (caller == adminToRemove) {
      Runtime.trap("Admins cannot remove themselves");
    };

    // Convert filtered results to array, clear the list, and repopulate it to maintain immutability
    let filteredAdminsArray = adminPrincipals.toArray().filter(func(admin) { admin != adminToRemove });
    adminPrincipals.clear();
    for (admin in filteredAdminsArray.values()) {
      adminPrincipals.add(admin);
    };
  };

  public query ({ caller }) func getAdmins() : async [Principal] {
    requireAdmin(caller);
    adminPrincipals.toArray();
  };

  public shared ({ caller }) func addProduct(name : Text, description : Text, price : Nat, category : Text, image : ?Text) : async () {
    requireAdmin(caller);
    if (name.size() == 0) {
      Runtime.trap("Product name cannot be empty");
    };
    if (name.size() > 255) {
      Runtime.trap("Product name too long (max 255 characters)");
    };
    if (description.size() == 0) {
      Runtime.trap("Product description cannot be empty");
    };
    if (description.size() > 1000) {
      Runtime.trap("Product description too long (max 1000 characters)");
    };
    if (price == 0) {
      Runtime.trap("Product price must be greater than 0");
    };
    if (category.size() == 0) {
      Runtime.trap("Product category cannot be empty");
    };
    if (categories.get(category) == null) {
      Runtime.trap("Category does not exist");
    };
    let product : Product = {
      id = nextProductId;
      name;
      description;
      price;
      category;
      image;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
  };

  public shared ({ caller }) func editProduct(id : Nat, name : Text, description : Text, price : Nat, category : Text, image : ?Text) : async () {
    requireAdmin(caller);
    if (name.size() == 0) {
      Runtime.trap("Product name cannot be empty");
    };
    if (name.size() > 255) {
      Runtime.trap("Product name too long (max 255 characters)");
    };
    if (description.size() == 0) {
      Runtime.trap("Product description cannot be empty");
    };
    if (description.size() > 1000) {
      Runtime.trap("Product description too long (max 1000 characters)");
    };
    if (price == 0) {
      Runtime.trap("Product price must be greater than 0");
    };
    if (category.size() == 0) {
      Runtime.trap("Product category cannot be empty");
    };
    if (categories.get(category) == null) {
      Runtime.trap("Category does not exist");
    };
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    let updatedProduct : Product = {
      id;
      name;
      description;
      price;
      category;
      image;
    };
    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    requireAdmin(caller);
    products.remove(id);
  };

  public query func getProducts(page : ?Nat, limit : ?Nat) : async PaginationResult<Product> {
    let (validatedPage, validatedLimit) = validatePagination(page, limit);
    paginateArray<Product>(products.values().toArray(), validatedPage, validatedLimit);
  };

  public query func getProductsByCategory(category : Text, page : ?Nat, limit : ?Nat) : async PaginationResult<Product> {
    if (category.size() == 0) {
      Runtime.trap("Category cannot be empty");
    };

    let (validatedPage, validatedLimit) = validatePagination(page, limit);
    let filtered = products.values().toArray().filter(func(p) { p.category == category });
    paginateArray<Product>(filtered, validatedPage, validatedLimit);
  };

  public shared ({ caller }) func addCategory(name : Text, description : Text, image : ?Text) : async () {
    requireAdmin(caller);
    if (name.size() == 0) {
      Runtime.trap("Category name cannot be empty");
    };
    if (name.size() > 255) {
      Runtime.trap("Category name too long (max 255 characters)");
    };
    if (description.size() == 0) {
      Runtime.trap("Category description cannot be empty");
    };
    if (description.size() > 1000) {
      Runtime.trap("Category description too long (max 1000 characters)");
    };
    if (categories.get(name) != null) {
      Runtime.trap("Category already exists");
    };
    categories.add(
      name,
      {
        name;
        description;
        image;
      },
    );
  };

  public query func getAllCategories() : async [Text] {
    categories.values().toArray().map(func(c) { c.name });
  };

  public query func getCategories(page : ?Nat, limit : ?Nat) : async PaginationResult<Category> {
    let (validatedPage, validatedLimit) = validatePagination(page, limit);
    paginateArray<Category>(categories.values().toArray(), validatedPage, validatedLimit);
  };

  public query ({ caller }) func getUser() : async ?Text {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func setUser(name : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot set user profiles");
    };
    if (name.size() == 0) {
      Runtime.trap("User name cannot be empty");
    };
    if (name.size() > 255) {
      Runtime.trap("User name too long (max 255 characters)");
    };
    let allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -_";
    for (char in name.chars()) {
      if (not allowedChars.contains(#char char)) {
        Runtime.trap("User name contains invalid characters (only letters, numbers, spaces, hyphens, and underscores allowed)");
      };
    };
    userProfiles.add(caller, name);
  };
};
