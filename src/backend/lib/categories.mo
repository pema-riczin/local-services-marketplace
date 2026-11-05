import Map "mo:core/Map";
import Types "../types/categories";
import Common "../types/common";

module {
  public func listCategories(
    categories : Map.Map<Common.CategoryId, Types.Category>,
  ) : [Types.Category] {
    categories.values().toArray();
  };

  public func createCategory(
    categories : Map.Map<Common.CategoryId, Types.Category>,
    state : { var nextCategoryId : Nat },
    name : Text,
  ) : Types.Category {
    let id = state.nextCategoryId;
    state.nextCategoryId := id + 1;
    let category : Types.Category = { id; name };
    categories.add(id, category);
    category;
  };

  public func updateCategory(
    categories : Map.Map<Common.CategoryId, Types.Category>,
    id : Common.CategoryId,
    name : Text,
  ) : ?Types.Category {
    switch (categories.get(id)) {
      case (?_) {
        let updated : Types.Category = { id; name };
        categories.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  public func deleteCategory(
    categories : Map.Map<Common.CategoryId, Types.Category>,
    id : Common.CategoryId,
  ) : Bool {
    switch (categories.get(id)) {
      case (?_) {
        categories.remove(id);
        true;
      };
      case null { false };
    };
  };
};
