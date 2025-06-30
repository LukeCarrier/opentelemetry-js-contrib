/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as opentelemetry from '@opentelemetry/sdk-node';
import { diag, DiagConsoleLogger } from '@opentelemetry/api';
import * as Sentry from '@sentry/node';
import { SentrySpanProcessor, SentryPropagator, SentrySampler } from '@sentry/opentelemetry';
import {
  getLogLevelFromEnv,
  getNodeAutoInstrumentations,
  getResourceDetectorsFromEnv,
} from './utils';

diag.setLogger(new DiagConsoleLogger(), getLogLevelFromEnv());

const sentryClient = Sentry.init({
  debug: process.env.SENTRY_DEBUG === 'true',
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1'),
  skipOpenTelemetrySetup: true,
});

const sdk = new opentelemetry.NodeSDK({
  instrumentations: getNodeAutoInstrumentations(),
  resourceDetectors: getResourceDetectorsFromEnv(),
  contextManager: new Sentry.SentryContextManager(),
  sampler: sentryClient ? new SentrySampler(sentryClient) : undefined,
  spanProcessors: [new SentrySpanProcessor()],
  textMapPropagator: new SentryPropagator(),
});

try {
  sdk.start();
  diag.info('OpenTelemetry automatic instrumentation started successfully');
} catch (error) {
  diag.error(
    'Error initializing OpenTelemetry SDK. Your application is not instrumented and will not produce telemetry',
    error
  );
}

Sentry.validateOpenTelemetrySetup();

async function shutdown(): Promise<void> {
  try {
    await sdk.shutdown();
    diag.debug('OpenTelemetry SDK terminated');
  } catch (error) {
    diag.error('Error terminating OpenTelemetry SDK', error);
  }
}

// Gracefully shutdown SDK if a SIGTERM is received
process.on('SIGTERM', shutdown);
// Gracefully shutdown SDK if Node.js is exiting normally
process.once('beforeExit', shutdown);
