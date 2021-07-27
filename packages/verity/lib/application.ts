import { createVerifiablePresentationJwt } from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import {
  EncodedCredentialApplication,
  CredentialManifest,
  DescriptorMap,
  DidKey
} from "../types"
import { verifiablePresentationPayload } from "./credentials"
import { didKeyToIssuer } from "./didKey"

export async function createCredentialApplication(
  didKey: DidKey,
  manifest: CredentialManifest
): Promise<EncodedCredentialApplication> {
  const client = didKeyToIssuer(didKey)

  const credentialApplication = {
    id: uuidv4(),
    manifest_id: manifest.id,
    format: {
      jwt_vp: manifest.presentation_definition?.format?.jwt_vp
    }
  }

  let presentationSubmission
  if (manifest.presentation_definition) {
    presentationSubmission = {
      id: uuidv4(),
      definition_id: manifest.presentation_definition?.id,
      descriptor_map:
        manifest.presentation_definition?.input_descriptors?.map<DescriptorMap>(
          (d) => {
            return {
              id: d.id,
              format: "jwt_vp",
              path: `$.presentation`
            }
          }
        )
    }
  }

  const payload = verifiablePresentationPayload(client.did)
  const vp = await createVerifiablePresentationJwt(payload, client)

  return {
    credential_application: credentialApplication,
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}
