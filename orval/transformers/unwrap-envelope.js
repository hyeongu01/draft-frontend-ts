// Orval input transformer.
// 백엔드는 응답을 봉투(allOf: [ResponseSuccess, { data: X }])로 문서화하지만,
// 런타임에는 customFetch(apiJson)가 .data를 벗겨서 반환한다.
// 따라서 생성 타입도 안쪽 data 타입(X)이어야 일치한다 → 여기서 봉투를 X로 치환.
//
// 변환 전: { allOf: [ {$ref: ResponseSuccess}, { properties: { data: <X> } } ] }
// 변환 후: <X>
const ENVELOPE_NAME = "ResponseSuccess";

const isEnvelopeRef = (s) =>
  s && typeof s.$ref === "string" && s.$ref.endsWith(`/${ENVELOPE_NAME}`);

function unwrap(schema) {
  if (!schema || !Array.isArray(schema.allOf)) return schema;
  if (!schema.allOf.some(isEnvelopeRef)) return schema;
  const dataPart = schema.allOf.find((s) => s && s.properties && s.properties.data);
  return dataPart ? dataPart.properties.data : schema;
}

module.exports = (spec) => {
  for (const pathItem of Object.values(spec.paths ?? {})) {
    for (const op of Object.values(pathItem)) {
      if (!op || typeof op !== "object" || !op.responses) continue;
      for (const resp of Object.values(op.responses)) {
        const json = resp && resp.content && resp.content["application/json"];
        if (json && json.schema) json.schema = unwrap(json.schema);
      }
    }
  }
  return spec;
};
