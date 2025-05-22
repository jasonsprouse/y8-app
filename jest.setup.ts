import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// You can add other global setup here if needed, for example, mocking window.location for redirect tests
// Object.defineProperty(window, 'location', {
//   writable: true,
//   value: {
//     href: 'http://localhost/',
//     search: '',
//     assign: jest.fn(),
//     replace: jest.fn(),
//   }
// });
