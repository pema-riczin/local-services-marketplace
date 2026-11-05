import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import CategoryTypes "../types/categories";
import CategoriesLib "../lib/categories";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  categories : Map.Map<Common.CategoryId, CategoryTypes.Category>,
  state : { var nextCategoryId : Nat },
) {
  public query func listCategories() : async [CategoryTypes.Category] {
    CategoriesLib.listCategories(categories);
  };

  public shared ({ caller }) func createCategory(name : Text) : async CategoryTypes.Category {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    CategoriesLib.createCategory(categories, state, name);
  };

  public shared ({ caller }) func updateCategory(id : Common.CategoryId, name : Text) : async ?CategoryTypes.Category {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    CategoriesLib.updateCategory(categories, id, name);
  };

  public shared ({ caller }) func deleteCategory(id : Common.CategoryId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    CategoriesLib.deleteCategory(categories, id);
  };
};
