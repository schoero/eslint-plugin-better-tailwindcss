export type LiteralValueQuotes = "'" | "\"" | "`";

export interface Range {
  range: [number, number];
}

export interface Loc {
  loc: {
    end: {
      column: number;
      line: number;
    };
    start: {
      column: number;
      line: number;
    };
  };
}

export interface MultilineMeta {
  multilineQuotes?: LiteralValueQuotes[] | undefined;
  supportsMultiline?: boolean | undefined;
  surroundingBraces?: boolean | undefined;
}

export interface WhitespaceMeta {
  leadingWhitespace?: string | undefined;
  trailingWhitespace?: string | undefined;
}

export interface QuoteMeta {
  closingQuote?: LiteralValueQuotes | undefined;
  openingQuote?: LiteralValueQuotes | undefined;
}
export interface BracesMeta {
  closingBraces?: string | undefined;
  openingBraces?: string | undefined;
}

export interface BindingMeta {
  binding?: undefined | {
    closing: string;
    multilineQuotes: LiteralValueQuotes[];
    opening: string;
    range: [number, number];
  };
}

export interface CSSMeta {
  leadingApply?: string | undefined;
  trailingSemicolon?: string | undefined;
}

export interface Concatenation {
  readonly hasDynamicLeftNeighbor: boolean;
  readonly hasDynamicRightNeighbor: boolean;
  readonly isConcatenatedLeft: boolean;
  readonly isConcatenatedRight: boolean;
  readonly leftLiterals: readonly Literal[];
  readonly rightLiterals: readonly Literal[];
}


export interface Indentation {
  indentation: {
    spaces: number;
    tabs: number;
  };
}

interface NodeBase extends Range, Loc {
  [key: PropertyKey]: unknown;
  type: string;
}

interface LiteralBase extends NodeBase, MultilineMeta, QuoteMeta, BracesMeta, BindingMeta, WhitespaceMeta, CSSMeta, Indentation, Range, Loc {
  content: string;
  raw: string;
  /** How this literal is concatenated with its neighbors. Computed on the first call, because only some rules need it. */
  getConcatenation: () => Concatenation;
  /** Literals before this one in the same expression. Computed on the first call, because only some rules need it. */
  getPriorLiterals: () => readonly Literal[];
  attribute?: string | undefined;
  isInterpolated?: boolean | undefined;
}

export interface TemplateLiteral extends LiteralBase {
  type: "TemplateLiteral";
}

export interface StringLiteral extends LiteralBase {
  type: "StringLiteral";
}

export interface CSSClassListLiteral extends LiteralBase {
  type: "CSSClassListLiteral";
  utility?: string | undefined;
}

export type Literal = CSSClassListLiteral | StringLiteral | TemplateLiteral;
