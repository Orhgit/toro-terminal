import { NextRequest, NextResponse } from "next/server";

// ============================================================
// Linear Sync — Move card in UI ↔ Move issue in Linear
// ============================================================

const LINEAR_API = "https://api.linear.app/graphql";

interface SyncPayload {
  propertyId: string;
  issueId: string;
  action: "move" | "update_status";
  targetState: string;
}

// Map our marketing statuses to Linear workflow state names
const STATUS_TO_LINEAR_STATE: Record<string, string> = {
  ai_processing: "In Progress",
  awaiting_graphics: "In Review",
  in_review: "In Review",
  published: "Done",
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "LINEAR_API_KEY not configured",
        mock: true,
        message: "Mock mode: card moved locally but Linear not synced",
      },
      { status: 200 }
    );
  }

  const body = (await request.json()) as SyncPayload;
  const linearState = STATUS_TO_LINEAR_STATE[body.targetState] ?? "In Progress";

  try {
    // Step 1: Find the workflow state ID for the target state
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
      (n) => n.name === linearState
    );

    if (!targetNode) {
      return NextResponse.json(
        { success: false, error: `Linear state "${linearState}" not found` },
        { status: 400 }
      );
    }

    // Step 2: Update the issue's state
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
      data?: { issueUpdate?: { success: boolean; issue?: { identifier: string; state?: { name: string } } } };
    };

    const issue = updateData.data?.issueUpdate;

    return NextResponse.json({
      success: issue?.success ?? false,
      issueId: issue?.issue?.identifier,
      newState: issue?.issue?.state?.name,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
