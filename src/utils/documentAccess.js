function getId(value) {
  if (!value) {
    return "";
  }

  return (value._id || value).toString();
}

function canEditDocument(document, userId) {
  const currentUserId = getId(userId);

  if (!document || !currentUserId) {
    return false;
  }

  const ownerId = getId(document.owner);
  const sharedUserIds = document.sharedWith || [];

  return (
    ownerId === currentUserId ||
    sharedUserIds.some((sharedUserId) => getId(sharedUserId) === currentUserId)
  );
}

module.exports = {
  canEditDocument,
  getId,
};
