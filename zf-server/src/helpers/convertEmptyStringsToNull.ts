// For Create/Update operations, the client may well send attributes with empty strings.
// For example a Transgene may have a nickname and the Angular Form control will contain
// an empty string if the user does not fill in a nickname.
// This function just converts such things to NULL for inserting into the database.

export function convertEmptyStringToNull(dto: any) {
  for (const key of Object.keys(dto)) {
    if ('string' === typeof dto[key] && dto[key] === '') {
      dto[key] = null;
    }
  }
}
