class Assert extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertError';
  }
}

export default function assert(actual: boolean, message: string) {
  if (!actual) {
    throw new Assert(message);
  }
}
