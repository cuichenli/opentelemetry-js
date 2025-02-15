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

import {
  Counter,
  ObservableResult,
  ObservableCounter,
  ObservableUpDownCounter,
  ObservableGauge,
  Histogram,
  ValueType,
} from '@opentelemetry/api-metrics';
import { InstrumentationLibrary, VERSION } from '@opentelemetry/core';
import * as metrics from '@opentelemetry/sdk-metrics-base';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import { otlpTypes } from '@opentelemetry/exporter-trace-otlp-http';

const meterProvider = new metrics.MeterProvider({
  interval: 30000,
  resource: new Resource({
    service: 'ui',
    version: 1,
    cost: 112.12,
  }),
});

const meter = meterProvider.getMeter('default', '0.0.1');

if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {
    from: function (arr: []) {
      return new Uint8Array(arr);
    },
  };
}

export function mockCounter(): metrics.Metric<metrics.BoundCounter> & Counter {
  const name = 'int-counter';
  const metric =
    meter['_metrics'].get(name) ||
    meter.createCounter(name, {
      description: 'sample counter description',
      valueType: ValueType.INT,
    });
  metric.clear();
  metric.bind({});
  return metric;
}

export function mockDoubleCounter(): metrics.Metric<metrics.BoundCounter> &
  Counter {
  const name = 'double-counter';
  const metric =
    meter['_metrics'].get(name) ||
    meter.createCounter(name, {
      description: 'sample counter description',
      valueType: ValueType.DOUBLE,
    });
  metric.clear();
  metric.bind({});
  return metric;
}

export function mockObservableGauge(
  callback: (observableResult: ObservableResult) => unknown,
  name = 'double-observable-gauge'
): metrics.Metric<metrics.BoundObservable> & ObservableGauge {
  const metric =
    meter['_metrics'].get(name) ||
    meter.createObservableGauge(
      name,
      {
        description: 'sample observable gauge description',
        valueType: ValueType.DOUBLE,
      },
      callback
    );
  metric.clear();
  metric.bind({});
  return metric;
}

export function mockObservableCounter(
  callback: (observableResult: ObservableResult) => unknown,
  name = 'double-observable-counter'
): metrics.Metric<metrics.BoundObservable> & ObservableCounter {
  const metric =
    meter['_metrics'].get(name) ||
    meter.createObservableCounter(
      name,
      {
        description: 'sample observable counter description',
        valueType: ValueType.DOUBLE,
      },
      callback
    );
  metric.clear();
  metric.bind({});
  return metric;
}

export function mockObservableUpDownCounter(
  callback: (observableResult: ObservableResult) => unknown,
  name = 'double-up-down-observable-counter'
): metrics.Metric<metrics.BoundObservable> & ObservableUpDownCounter {
  const metric =
    meter['_metrics'].get(name) ||
    meter.createObservableUpDownCounter(
      name,
      {
        description: 'sample observable up down counter description',
        valueType: ValueType.DOUBLE,
      },
      callback
    );
  metric.clear();
  metric.bind({});
  return metric;
}

export function mockHistogram(): metrics.Metric<metrics.BoundHistogram> &
  Histogram {
  const name = 'int-histogram';
  const metric =
    meter['_metrics'].get(name) ||
    meter.createHistogram(name, {
      description: 'sample histogram description',
      valueType: ValueType.INT,
      boundaries: [0, 100],
    });
  metric.clear();
  metric.bind({});
  return metric;
}

export const mockedResources: Resource[] = [
  new Resource({ name: 'resource 1' }),
  new Resource({ name: 'resource 2' }),
];

export const mockedInstrumentationLibraries: InstrumentationLibrary[] = [
  {
    name: 'lib1',
    version: '0.0.1',
  },
  {
    name: 'lib2',
    version: '0.0.2',
  },
];

export const multiResourceMetricsGet = function (
  callback: (observableResult: ObservableResult) => unknown
): any[] {
  return [
    {
      ...mockCounter(),
      resource: mockedResources[0],
      instrumentationLibrary: mockedInstrumentationLibraries[0],
    },
    {
      ...mockObservableGauge(callback),
      resource: mockedResources[1],
      instrumentationLibrary: mockedInstrumentationLibraries[0],
    },
    {
      ...mockCounter(),
      resource: mockedResources[0],
      instrumentationLibrary: mockedInstrumentationLibraries[0],
    },
  ];
};

export const multiInstrumentationLibraryMetricsGet = function (
  callback: (observableResult: ObservableResult) => unknown
): any[] {
  return [
    {
      ...mockCounter(),
      resource: mockedResources[0],
      instrumentationLibrary: mockedInstrumentationLibraries[0],
    },
    {
      ...mockObservableGauge(callback),
      resource: mockedResources[0],
      instrumentationLibrary: mockedInstrumentationLibraries[1],
    },
    {
      ...mockCounter(),
      resource: mockedResources[0],
      instrumentationLibrary: mockedInstrumentationLibraries[0],
    },
  ];
};

export function ensureAttributesAreCorrect(
  attributes: otlpTypes.opentelemetryProto.common.v1.KeyValue[]
) {
  assert.deepStrictEqual(
    attributes,
    [
      {
        key: 'component',
        value: {
          stringValue: 'document-load',
        },
      },
    ],
    'attributes are incorrect'
  );
}

export function ensureWebResourceIsCorrect(
  resource: otlpTypes.opentelemetryProto.resource.v1.Resource
) {
  assert.strictEqual(resource.attributes.length, 7);
  assert.strictEqual(resource.attributes[0].key, 'service.name');
  assert.strictEqual(resource.attributes[0].value.stringValue, 'unknown_service');
  assert.strictEqual(resource.attributes[1].key, 'telemetry.sdk.language');
  assert.strictEqual(resource.attributes[1].value.stringValue, 'webjs');
  assert.strictEqual(resource.attributes[2].key, 'telemetry.sdk.name');
  assert.strictEqual(resource.attributes[2].value.stringValue, 'opentelemetry');
  assert.strictEqual(resource.attributes[3].key, 'telemetry.sdk.version');
  assert.strictEqual(resource.attributes[3].value.stringValue, VERSION);
  assert.strictEqual(resource.attributes[4].key, 'service');
  assert.strictEqual(resource.attributes[4].value.stringValue, 'ui');
  assert.strictEqual(resource.attributes[5].key, 'version');
  assert.strictEqual(resource.attributes[5].value.intValue, 1);
  assert.strictEqual(resource.attributes[6].key, 'cost');
  assert.strictEqual(resource.attributes[6].value.doubleValue, 112.12);
  assert.strictEqual(resource.droppedAttributesCount, 0);
}

export function ensureCounterIsCorrect(
  metric: otlpTypes.opentelemetryProto.metrics.v1.Metric,
  time: number
) {
  assert.deepStrictEqual(metric, {
    name: 'int-counter',
    description: 'sample counter description',
    unit: '1',
    intSum: {
      dataPoints: [
        {
          labels: [],
          value: 1,
          startTimeUnixNano: 1592602232694000000,
          timeUnixNano: time,
        },
      ],
      isMonotonic: true,
      aggregationTemporality:
        otlpTypes.opentelemetryProto.metrics.v1.AggregationTemporality
          .AGGREGATION_TEMPORALITY_CUMULATIVE,
    },
  });
}

export function ensureDoubleCounterIsCorrect(
  metric: otlpTypes.opentelemetryProto.metrics.v1.Metric,
  time: number
) {
  assert.deepStrictEqual(metric, {
    name: 'double-counter',
    description: 'sample counter description',
    unit: '1',
    doubleSum: {
      dataPoints: [
        {
          labels: [],
          value: 8,
          startTimeUnixNano: 1592602232694000000,
          timeUnixNano: time,
        },
      ],
      isMonotonic: true,
      aggregationTemporality:
        otlpTypes.opentelemetryProto.metrics.v1.AggregationTemporality
          .AGGREGATION_TEMPORALITY_CUMULATIVE,
    },
  });
}

export function ensureObservableGaugeIsCorrect(
  metric: otlpTypes.opentelemetryProto.metrics.v1.Metric,
  time: number,
  value: number,
  name = 'double-observable-gauge'
) {
  assert.deepStrictEqual(metric, {
    name,
    description: 'sample observable gauge description',
    unit: '1',
    doubleGauge: {
      dataPoints: [
        {
          labels: [],
          value,
          startTimeUnixNano: 1592602232694000000,
          timeUnixNano: time,
        },
      ],
    },
  });
}

export function ensureObservableCounterIsCorrect(
  metric: otlpTypes.opentelemetryProto.metrics.v1.Metric,
  time: number,
  value: number,
  name = 'double-observable-counter'
) {
  assert.deepStrictEqual(metric, {
    name,
    description: 'sample observable counter description',
    unit: '1',
    doubleSum: {
      isMonotonic: true,
      dataPoints: [
        {
          labels: [],
          value,
          startTimeUnixNano: 1592602232694000000,
          timeUnixNano: time,
        },
      ],
      aggregationTemporality:
        otlpTypes.opentelemetryProto.metrics.v1.AggregationTemporality
          .AGGREGATION_TEMPORALITY_CUMULATIVE,
    },
  });
}

export function ensureObservableUpDownCounterIsCorrect(
  metric: otlpTypes.opentelemetryProto.metrics.v1.Metric,
  time: number,
  value: number,
  name = 'double-up-down-observable-counter'
) {
  assert.deepStrictEqual(metric, {
    name,
    description: 'sample observable up down counter description',
    unit: '1',
    doubleSum: {
      isMonotonic: false,
      dataPoints: [
        {
          labels: [],
          value,
          startTimeUnixNano: 1592602232694000000,
          timeUnixNano: time,
        },
      ],
      aggregationTemporality:
        otlpTypes.opentelemetryProto.metrics.v1.AggregationTemporality
          .AGGREGATION_TEMPORALITY_CUMULATIVE,
    },
  });
}

export function ensureHistogramIsCorrect(
  metric: otlpTypes.opentelemetryProto.metrics.v1.Metric,
  time: number,
  explicitBounds: (number | null)[] = [Infinity],
  bucketCounts: number[] = [2, 0]
) {
  assert.deepStrictEqual(metric, {
    name: 'int-histogram',
    description: 'sample histogram description',
    unit: '1',
    intHistogram: {
      dataPoints: [
        {
          labels: [],
          sum: 21,
          count: 2,
          startTimeUnixNano: 1592602232694000000,
          timeUnixNano: time,
          bucketCounts,
          explicitBounds,
        },
      ],
      aggregationTemporality:
        otlpTypes.opentelemetryProto.metrics.v1.AggregationTemporality
          .AGGREGATION_TEMPORALITY_CUMULATIVE,
    },
  });
}

export function ensureExportMetricsServiceRequestIsSet(
  json: otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest
) {
  const resourceMetrics = json.resourceMetrics;
  assert.strictEqual(
    resourceMetrics.length,
    1,
    'resourceMetrics has incorrect length'
  );

  const resource = resourceMetrics[0].resource;
  assert.strictEqual(!!resource, true, 'resource is missing');

  const instrumentationLibraryMetrics =
    resourceMetrics[0].instrumentationLibraryMetrics;
  assert.strictEqual(
    instrumentationLibraryMetrics && instrumentationLibraryMetrics.length,
    1,
    'instrumentationLibraryMetrics is missing'
  );

  const instrumentationLibrary =
    instrumentationLibraryMetrics[0].instrumentationLibrary;
  assert.strictEqual(
    !!instrumentationLibrary,
    true,
    'instrumentationLibrary is missing'
  );

  const metrics = resourceMetrics[0].instrumentationLibraryMetrics[0].metrics;
  assert.strictEqual(metrics.length, 3, 'Metrics are missing');
}

export function ensureHeadersContain(
  actual: { [key: string]: string },
  expected: { [key: string]: string }
) {
  Object.entries(expected).forEach(([k, v]) => {
    assert.strictEqual(
      v,
      actual[k],
      `Expected ${actual} to contain ${k}: ${v}`
    );
  });
}
