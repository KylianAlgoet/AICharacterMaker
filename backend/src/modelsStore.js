const models = new Map();

export function saveModel(model) {
  models.set(model.id, model);
}

export function getModel(id) {
  return models.get(id);
}

export function listModels() {
  return Array.from(models.values()).sort((a, b) => b.createdAt - a.createdAt);
}