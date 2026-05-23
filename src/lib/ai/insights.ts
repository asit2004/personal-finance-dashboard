/**
 * AI-powered financial insights generator.
 * Summarises the user's last 3 months of transactions and asks the model
 * to produce actionable, personalised insights.
 */
import { chat } from "./openrouter";

export interface AIInsight {
  title: string;
  body: string;
  type: "warning" | "success" | "tip" | "info";
  impact: "high" | "medium" | "low";
  category?: string;
  actionLabel?: string;
  actionUrl?: string;
}

interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  topCategories: { category: string; amount: number; count: number; pct: number }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
  avgTransactionAmount: number;
  largestExpense: { description: string; amount: number; category: string } | null;
  unusualSpikes: { category: string; thisMonth: number; avg: number }[];
}

const SYSTEM_PROMPT = `You are a sharp, empathetic personal finance advisor for Indian millennials and Gen-Z.
Analyze the user's transaction summary and generate 4-6 concise, actionable financial insights.

Guidelines:
- Be specific — cite actual numbers (₹ amounts, percentages).
- Keep "body" under 2 sentences, plain English, no jargon.
- Mix positive reinforcement with honest warnings.
- Use Indian context: savings rates, SIP, emergency fund, UPI habits.
- "type" must be one of: warning | success | tip | info
- "impact" must be one of: high | medium | low
- "actionUrl" should be one of: /transactions | /analytics | /budgets | /insights (or omit)

Return ONLY a valid JSON array of insight objects with this shape:
[{
  "title": string,
  "body": string,
  "type": "warning"|"success"|"tip"|"info",
  "impact": "high"|"medium"|"low",
  "category": string (optional, e.g. "food"),
  "actionLabel": string (optional),
  "actionUrl": string (optional)
}]`;

/**
 * Build a compact summary of the user's financial data for the AI prompt.
 * This is intentionally terse — we're minimising tokens while maximising signal.
 */
export function buildSummaryText(summary: TransactionSummary): string {
  const lines: string[] = [
    `Period: last 3 months`,
    `Income: ₹${summary.totalIncome.toLocaleString("en-IN")}`,
    `Expenses: ₹${summary.totalExpenses.toLocaleString("en-IN")}`,
    `Savings rate: ${summary.savingsRate}%`,
    `Avg transaction: ₹${Math.round(summary.avgTransactionAmount).toLocaleString("en-IN")}`,
  ];

  if (summary.largestExpense) {
    lines.push(`Largest expense: ₹${summary.largestExpense.amount.toLocaleString("en-IN")} on ${summary.largestExpense.description} (${summary.largestExpense.category})`);
  }

  if (summary.topCategories.length > 0) {
    lines.push(`Top spending categories:`);
    summary.topCategories.slice(0, 5).forEach((c) => {
      lines.push(`  - ${c.category}: ₹${c.amount.toLocaleString("en-IN")} (${c.pct}% of expenses, ${c.count} transactions)`);
    });
  }

  if (summary.monthlyTrend.length > 0) {
    lines.push(`Monthly trend (income / expenses):`);
    summary.monthlyTrend.forEach((m) => {
      lines.push(`  - ${m.month}: ₹${m.income.toLocaleString("en-IN")} in / ₹${m.expenses.toLocaleString("en-IN")} out`);
    });
  }

  if (summary.unusualSpikes.length > 0) {
    lines.push(`Unusual spikes this month:`);
    summary.unusualSpikes.forEach((s) => {
      const pctUp = Math.round(((s.thisMonth - s.avg) / s.avg) * 100);
      lines.push(`  - ${s.category}: ₹${s.thisMonth.toLocaleString("en-IN")} this month vs ₹${s.avg.toLocaleString("en-IN")} avg (${pctUp}% above avg)`);
    });
  }

  return lines.join("\n");
}

/**
 * Generate AI insights from a pre-built summary object.
 * Returns an array of AIInsight objects or null on error.
 */
export async function generateAIInsights(
  summary: TransactionSummary,
): Promise<AIInsight[] | null> {
  const summaryText = buildSummaryText(summary);

  try {
    const raw = await chat(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: summaryText },
      ],
      {
        model: process.env.OPENROUTER_INSIGHTS_MODEL ?? process.env.OPENROUTER_MODEL ?? "mistralai/mistral-7b-instruct",
        temperature: 0.4,
        max_tokens: 1500,
        responseFormat: "json_object",
      },
    );

    // The model might wrap the array in an object like { "insights": [...] }
    let parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      parsed = parsed.insights ?? parsed.data ?? Object.values(parsed)[0] ?? [];
    }

    const validTypes = ["warning", "success", "tip", "info"];
    const validImpacts = ["high", "medium", "low"];

    // Validate and sanitize each insight
    return (parsed as AIInsight[])
      .filter((i) => i?.title && i?.body)
      .map((i) => ({
        title: String(i.title).slice(0, 120),
        body: String(i.body).slice(0, 400),
        type: validTypes.includes(i.type) ? i.type : "info",
        impact: validImpacts.includes(i.impact) ? i.impact : "medium",
        ...(i.category ? { category: String(i.category) } : {}),
        ...(i.actionLabel ? { actionLabel: String(i.actionLabel) } : {}),
        ...(i.actionUrl ? { actionUrl: String(i.actionUrl) } : {}),
      }))
      .slice(0, 8); // max 8 insights
  } catch (err) {
    console.error("[AI Insights] Failed:", err);
    return null;
  }
}

export type { TransactionSummary };
