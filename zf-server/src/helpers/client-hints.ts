// This object can be passed to the client to assist the client in making presentation decisions
class ClientHints {
  // this is a hint that the object in question can present as deleteable or not.
  // It is generally false if the object in question should not be deleted because
  // it is part of one or more relationships.
  // e.g. you should not delete a stock if it has children stocks
  // e.g. you should not delete a mutation if there exists a stock with said mutation
  isDeletable: boolean = false;

  // there will be more I think.
}
