import "@testing-library/jest-dom/extend-expect";
import { InitStateDecl } from "./AST";

declare global {
    namespace jest {
      interface Matchers<R> {
        toBeWithinRange(a: number, b: number): R;
        toEqualTerm(b: Term): R;
        toEqualInit(b: InitStateDecl): R;
      }
    }
  }