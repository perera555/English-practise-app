import { BE_BOOK } from "./be";
import { MUST_BOOK, SHOULD_BOOK, WOULD_BOOK } from "./modals";
import { IF_COULD_BOOK, IF_WERE_BOOK } from "./ifs";
import type { Book } from "./engine";

export { FORMS, type Book, type Form, type Level, type Sentence } from "./engine";

/** Sentence Patterns: 6 books × 1,500 sentences (5 levels × 300), each with a Sinhala meaning. */
export const BOOKS: Book[] = [BE_BOOK, MUST_BOOK, SHOULD_BOOK, WOULD_BOOK, IF_WERE_BOOK, IF_COULD_BOOK];

export const getBook = (id: string) => BOOKS.find((b) => b.id === id);

export const bookCount = (b: Book) => b.levels.reduce((n, l) => n + l.sentences.length, 0);
