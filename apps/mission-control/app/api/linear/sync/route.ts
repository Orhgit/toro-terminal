import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================
// Linear Sync — Move card in UI ↔ Move issue in Linear
// ============================================================

const LINEAR_API = "https://api.linear.app/graphql";

const SyncBody = z.object({
  propertyId: z.string().min(1).max(100),
  issueId: z.string().min(1).max(100),
  action: z.enum(["move", "update_status"]),
  targetState: z.enum([
    "ai_processing",
    "awaiting_graphics",
    "in_review",
    "published",
  ]),
});

// Map our marketing statuses to Linear workflow state names
const STATUS_TO_LINEAR_STATE: Record<string, string> = {
  ai_processing: "In Progress",
  awaiting_graphics: "In Review",
  in_review: "In Review",
  published: "Done",
};

export async function POST(request: NextRequest): Promise<Response> {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "LINEAR_API_KEY not configured",
        mock: true,
        message: "Mock mode: card moved locally but Linear not synced",
      },
      { status: 200 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SyncBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;
  const linearState = STATUS_TO_LINEAR_STATE[body.targetState] ?? "In Progress";

  try {
    const teamId = process.env.LINEAR_TEAM_ID;

    const stateQuery = `
      query GetStates($teamId: String!) {
        workflowStates(filter: { team: { id: { eq: $teamId } } }) {
          nodes { id name }
        }
      }
    `;

    const stateRes = await fetch(LINEAR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        query: stateQuery,
        variables: { teamId },
      }),
    });

    const stateData = (await stateRes.json()) as {
      data?: { workflowStates?: { nodes: Array<{ id: string; name: string }> } };
    };

    const targetNode = stateData.data?.workflowStates?.nodes.find(
      (n) => n.name === linearState,
    );

    if (!targetNode) {
      return NextResponse.json(
        { success: false, error: `Linear state "${linearState}" not found` },
        { status: 400 },
      );
    }

    const updateMutation = `
      mutation UpdateIssue($issueId: String!, $stateId: String!) {
        issueUpdate(id: $issueId, input: { stateId: $stateId }) {
          success
          issue { id identifier state { name } }
        }
      }
    `;

    const updateRes = await fetch(LINEAR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        query: updateMutation,
        variables: { issueId: body.issueId, stateId: targetNode.id },
      }),
    });

    const updateData = (await updateRes.json()) as {
      data?: {
        issueUpdate?: {
          success: boolean;
          issue?: { identifier: string; state?: { name: string } };
        };
      };
    };

    const issue = updateData.data?.issueUpdate;

    return NextResponse.json({
      success: issue?.success ?? false,
      issueId: issue?.issue?.identifier,
      newState: issue?.issue?.state?.name,
    });
  } catch (err) {
    // Never echo `apiKey` or other secrets back to the client.
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
