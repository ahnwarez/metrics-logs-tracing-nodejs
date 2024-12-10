import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-otlp-grpc";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "user-service",
  })
);
const traceExporter = new OTLPTraceExporter({
  url: "tempo:4317",
});
const sdk = new NodeSDK({
  resource: resource,
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
