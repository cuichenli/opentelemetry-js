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

import { HrTime } from '@opentelemetry/api';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { MetricData } from '../export/MetricData';
import { Maybe } from '../utils';
import { MetricCollectorHandle } from './MetricCollector';

/**
 * Internal interface.
 *
 * Represents a storage from which we can collect metrics.
 */
export interface MetricStorage {
  /**
   * Collects the metrics from this storage.
   *
   * Note: This is a stateful operation and may reset any interval-related
   * state for the MetricCollector.
   */
  collect(
    collector: MetricCollectorHandle,
    collectors: MetricCollectorHandle[],
    resource: Resource,
    instrumentationLibrary: InstrumentationLibrary,
    sdkStartTime: HrTime,
    collectionTime: HrTime,
  ): Promise<Maybe<MetricData>>;
}
