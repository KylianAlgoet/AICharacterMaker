// backend/src/mixamoClient.js
import { getModel, saveModel } from "./modelsStore.js";

// Kleine helper om te "wachten"
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simuleert een rigging-pipeline (bv. via Mixamo).
 * Voor nu:
 *  - checkt of het model bestaat & klaar is
 *  - wacht een paar seconden
 *  - markeert het model als 'rigged'
 *  - zet riggedDownloadUrl (nu gewoon hetzelfde als de originele .glb)
 *
 * Later kan je hier echte Mixamo/autorigger integreren.
 */
export async function generateRiggedVersion(id) {
  const model = getModel(id);
  if (!model) {
    throw new Error("Model not found");
  }

  if (!model.downloadUrl) {
    throw new Error("Base model is not ready yet");
  }

  // Als hij al gerigged is, gewoon teruggeven
  if (model.rigged && model.riggedDownloadUrl) {
    return model;
  }

  console.log("[Rigging] Starting fake rigging for model:", id);

  // 💡 Hier zou je in de toekomst:
  // 1) model.downloadUrl downloaden
  // 2) uploaden naar Mixamo / autorigger
  // 3) gerigged FBX/GLB opslaan en URL bewaren
  // Voor nu: gewoon een "processing" simulatie
  await delay(5000);

  model.rigged = true;
  // In een echte flow zou dit de URL zijn naar een nieuw rigged bestand (bv. .fbx)
  model.riggedDownloadUrl = model.downloadUrl;

  saveModel(model);

  console.log("[Rigging] Done for model:", id);

  return model;
}
