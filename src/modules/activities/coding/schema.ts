import { z } from 'zod';

const jsonValue: z.ZodType<unknown> = z.unknown();

export const codingConfigSchema = z.object({
  instructions: z.string().min(1),
  starterCode: z.string().min(1),
  // The function the tests call, e.g. "isValidEmail"
  functionName: z.string().regex(/^[A-Za-z_$][\w$]*$/, 'must be a valid JavaScript function name'),
  tests: z
    .array(
      z.object({
        args: z.array(jsonValue),
        expected: jsonValue,
        label: z.string().optional(),
      }),
    )
    .min(1)
    .max(12),
  /** Optional context for the AI hint, e.g. "this code was written by an AI agent and has 2 bugs" */
  hintContext: z.string().optional(),
});

export type CodingConfig = z.infer<typeof codingConfigSchema>;

export interface TestResult {
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}
