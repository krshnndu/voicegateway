// Numeric-only excerpt of the OSS console capture fixtures, extracted through buildModel.
// Session numbers are anonymous display labels. No transcripts, identifiers or audio are included.
// Source: dashboard/src/lib/api.ts and features/call/call-model.ts, excerpted 15 October 2026.
export type CapturedTurn = {
  session: number;
  turn: number;
  responseMs: number;
  derived: boolean;
  firstTokenMs: number | null;
  firstAudioMs: number | null;
};

export const BUDGET_MS = 1500;
export const CAPTURED_CALL_COUNT = 16;
export const capturedTurns: CapturedTurn[] = [
  {
    "session": 1,
    "turn": 1,
    "responseMs": 4440,
    "derived": false,
    "firstTokenMs": 1315,
    "firstAudioMs": 1201
  },
  {
    "session": 1,
    "turn": 2,
    "responseMs": 3161,
    "derived": false,
    "firstTokenMs": 445,
    "firstAudioMs": 1375
  },
  {
    "session": 2,
    "turn": 2,
    "responseMs": 2852,
    "derived": false,
    "firstTokenMs": 399,
    "firstAudioMs": 850
  },
  {
    "session": 2,
    "turn": 3,
    "responseMs": 3453,
    "derived": false,
    "firstTokenMs": 735,
    "firstAudioMs": 1509
  },
  {
    "session": 2,
    "turn": 4,
    "responseMs": 2099,
    "derived": false,
    "firstTokenMs": 594,
    "firstAudioMs": 1013
  },
  {
    "session": 2,
    "turn": 5,
    "responseMs": 2579,
    "derived": false,
    "firstTokenMs": 771,
    "firstAudioMs": 689
  },
  {
    "session": 3,
    "turn": 2,
    "responseMs": 2304,
    "derived": false,
    "firstTokenMs": 523,
    "firstAudioMs": 661
  },
  {
    "session": 3,
    "turn": 3,
    "responseMs": 2294,
    "derived": false,
    "firstTokenMs": 529,
    "firstAudioMs": 877
  },
  {
    "session": 3,
    "turn": 4,
    "responseMs": 1345,
    "derived": false,
    "firstTokenMs": 476,
    "firstAudioMs": 503
  },
  {
    "session": 3,
    "turn": 5,
    "responseMs": 2298,
    "derived": false,
    "firstTokenMs": 524,
    "firstAudioMs": 809
  },
  {
    "session": 3,
    "turn": 6,
    "responseMs": 1333,
    "derived": false,
    "firstTokenMs": 456,
    "firstAudioMs": 522
  },
  {
    "session": 4,
    "turn": 2,
    "responseMs": 3036,
    "derived": false,
    "firstTokenMs": 685,
    "firstAudioMs": 1381
  },
  {
    "session": 4,
    "turn": 3,
    "responseMs": 2673,
    "derived": false,
    "firstTokenMs": 490,
    "firstAudioMs": 789
  },
  {
    "session": 4,
    "turn": 4,
    "responseMs": 2233,
    "derived": false,
    "firstTokenMs": 519,
    "firstAudioMs": 681
  },
  {
    "session": 4,
    "turn": 5,
    "responseMs": 2379,
    "derived": false,
    "firstTokenMs": 403,
    "firstAudioMs": 1036
  },
  {
    "session": 5,
    "turn": 1,
    "responseMs": 760,
    "derived": true,
    "firstTokenMs": null,
    "firstAudioMs": null
  },
  {
    "session": 5,
    "turn": 2,
    "responseMs": 910,
    "derived": true,
    "firstTokenMs": null,
    "firstAudioMs": null
  },
  {
    "session": 5,
    "turn": 3,
    "responseMs": 1340,
    "derived": true,
    "firstTokenMs": null,
    "firstAudioMs": null
  },
  {
    "session": 5,
    "turn": 4,
    "responseMs": 770,
    "derived": true,
    "firstTokenMs": null,
    "firstAudioMs": null
  },
  {
    "session": 5,
    "turn": 5,
    "responseMs": 830,
    "derived": true,
    "firstTokenMs": null,
    "firstAudioMs": null
  },
  {
    "session": 5,
    "turn": 6,
    "responseMs": 920,
    "derived": true,
    "firstTokenMs": null,
    "firstAudioMs": null
  },
  {
    "session": 5,
    "turn": 7,
    "responseMs": 670,
    "derived": true,
    "firstTokenMs": null,
    "firstAudioMs": null
  },
  {
    "session": 5,
    "turn": 8,
    "responseMs": 950,
    "derived": true,
    "firstTokenMs": null,
    "firstAudioMs": null
  },
  {
    "session": 5,
    "turn": 9,
    "responseMs": 990,
    "derived": true,
    "firstTokenMs": null,
    "firstAudioMs": null
  },
  {
    "session": 6,
    "turn": 2,
    "responseMs": 2665,
    "derived": false,
    "firstTokenMs": 191,
    "firstAudioMs": 152
  },
  {
    "session": 6,
    "turn": 3,
    "responseMs": 2671,
    "derived": false,
    "firstTokenMs": 345,
    "firstAudioMs": 156
  },
  {
    "session": 6,
    "turn": 4,
    "responseMs": 2676,
    "derived": false,
    "firstTokenMs": 189,
    "firstAudioMs": 165
  },
  {
    "session": 6,
    "turn": 5,
    "responseMs": 3256,
    "derived": false,
    "firstTokenMs": 226,
    "firstAudioMs": 175
  }
];

// Matches the console's upper-middle median convention.
export const medianAnswer = [...capturedTurns].sort((a, b) => a.responseMs - b.responseMs)[Math.floor(capturedTurns.length / 2)].responseMs;
export const overBudgetCount = capturedTurns.filter(turn => turn.responseMs > BUDGET_MS).length;

export type RouteNode = {
  id: string;
  title: string;
  subtitle: string;
  metric: string;
  metricLabel: string;
  detail: string;
  facts: { label: string; value: string }[];
};

// Rounded display values from the captured vg-capture topology, using wire-data.ts medians.
// This is an aggregate route: one of the agent's three captured calls came through SIP.
export const routeNodes: RouteNode[] = [
  {
    id: 'phone', title: 'Phone bridge', subtitle: 'SIP · 1 captured call', metric: '4.98 s', metricLabel: 'Call setup',
    detail: 'From ringing to answered, measured from one captured SIP call. This is setup time, not audio latency.',
    facts: [{ label: 'Phone calls observed', value: '1' }, { label: 'Audio delay to media server', value: 'Not reported' }],
  },
  {
    id: 'media', title: 'Media server', subtitle: 'LiveKit Cloud', metric: '15', metricLabel: 'Rooms watched',
    detail: 'Room and participant events connect the phone leg to the agent. The capture does not report audio transit time on the SIP leg.',
    facts: [{ label: 'SIP audio latency', value: 'Not reported' }, { label: 'Caller network latency', value: 'Not reported' }],
  },
  {
    id: 'agent', title: 'vg-capture', subtitle: 'Self-hosted agent', metric: '2.30 s', metricLabel: 'Median answer',
    detail: 'From the caller stopping to the agent speaking, across 11 measured turns. One of the three captured calls arrived by phone.',
    facts: [{ label: 'Captured calls', value: '3' }, { label: 'Measured turns', value: '11' }],
  },
  {
    id: 'stt', title: 'Deepgram', subtitle: 'Speech to text', metric: '230 ms', metricLabel: 'Final transcript',
    detail: 'Median transcription delay over the agent’s captured turns. This measures the stage, not network transit between these boxes.',
    facts: [{ label: 'Captured turns', value: '11' }, { label: 'Measurement', value: 'Transcription delay' }],
  },
  {
    id: 'model', title: 'OpenAI', subtitle: 'Language + voice', metric: '758 ms', metricLabel: 'First token',
    detail: 'The language model and voice model report separate timings. Stage medians can overlap and do not add up to the median answer.',
    facts: [{ label: 'First audio', value: '850 ms' }, { label: 'Stages observed', value: 'LLM + TTS' }],
  },
];
