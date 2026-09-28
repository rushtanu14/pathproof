# PathProof workflow audit

8 of 8 modeled scenarios terminate. 0 finding groups.

Exhaustive over every combination of the modeled, fixed boolean inputs only. Inputs never change during execution. Ambiguous decisions stop immediately; reachability means visited under these deterministic semantics. This is not a certification of a live form, external services, human behavior, timing, or unmodeled states.

## Reproducible model and complete evidence

The JSON below contains the model, every checked scenario, exact node and edge paths, and one counterexample per finding group.

```json
{
  "tool": "PathProof",
  "reportVersion": 1,
  "generatedAt": "2026-09-27T01:09:38.752Z",
  "scope": "Exhaustive over every combination of the modeled, fixed boolean inputs only. Inputs never change during execution. Ambiguous decisions stop immediately; reachability means visited under these deterministic semantics. This is not a certification of a live form, external services, human behavior, timing, or unmodeled states.",
  "limits": {
    "inputs": 8,
    "nodes": 32,
    "edges": 96,
    "text": 100000,
    "depth": 5,
    "group": 16,
    "conditions": 1024
  },
  "model": {
    "version": 1,
    "name": "Library equipment borrowing",
    "inputs": [
      "member",
      "training",
      "itemAvailable"
    ],
    "start": "membership",
    "nodes": [
      {
        "id": "membership",
        "label": "Library member?",
        "terminal": false
      },
      {
        "id": "training",
        "label": "Training complete?",
        "terminal": false
      },
      {
        "id": "stock",
        "label": "Item available?",
        "terminal": false
      },
      {
        "id": "join",
        "label": "Become a member",
        "terminal": true
      },
      {
        "id": "learn",
        "label": "Book training",
        "terminal": true
      },
      {
        "id": "borrow",
        "label": "Borrow equipment",
        "terminal": true
      },
      {
        "id": "wait",
        "label": "Join the waitlist",
        "terminal": true
      }
    ],
    "edges": [
      {
        "id": "member-yes",
        "from": "membership",
        "to": "training",
        "when": {
          "input": "member",
          "equals": true
        }
      },
      {
        "id": "member-no",
        "from": "membership",
        "to": "join",
        "when": {
          "input": "member",
          "equals": false
        }
      },
      {
        "id": "trained-yes",
        "from": "training",
        "to": "stock",
        "when": {
          "input": "training",
          "equals": true
        }
      },
      {
        "id": "stock-yes",
        "from": "stock",
        "to": "borrow",
        "when": {
          "input": "itemAvailable",
          "equals": true
        }
      },
      {
        "id": "stock-no",
        "from": "stock",
        "to": "wait",
        "when": {
          "input": "itemAvailable",
          "equals": false
        }
      },
      {
        "id": "trained-no",
        "from": "training",
        "to": "learn",
        "when": {
          "input": "training",
          "equals": false
        }
      }
    ]
  },
  "audit": {
    "total": 8,
    "completed": 8,
    "runs": [
      {
        "assignment": {
          "member": false,
          "training": false,
          "itemAvailable": false
        },
        "path": [
          "membership",
          "join"
        ],
        "edges": [
          "member-no"
        ],
        "node": "join",
        "matchingEdges": [],
        "outcome": "terminal"
      },
      {
        "assignment": {
          "member": true,
          "training": false,
          "itemAvailable": false
        },
        "path": [
          "membership",
          "training",
          "learn"
        ],
        "edges": [
          "member-yes",
          "trained-no"
        ],
        "node": "learn",
        "matchingEdges": [],
        "outcome": "terminal"
      },
      {
        "assignment": {
          "member": false,
          "training": true,
          "itemAvailable": false
        },
        "path": [
          "membership",
          "join"
        ],
        "edges": [
          "member-no"
        ],
        "node": "join",
        "matchingEdges": [],
        "outcome": "terminal"
      },
      {
        "assignment": {
          "member": true,
          "training": true,
          "itemAvailable": false
        },
        "path": [
          "membership",
          "training",
          "stock",
          "wait"
        ],
        "edges": [
          "member-yes",
          "trained-yes",
          "stock-no"
        ],
        "node": "wait",
        "matchingEdges": [],
        "outcome": "terminal"
      },
      {
        "assignment": {
          "member": false,
          "training": false,
          "itemAvailable": true
        },
        "path": [
          "membership",
          "join"
        ],
        "edges": [
          "member-no"
        ],
        "node": "join",
        "matchingEdges": [],
        "outcome": "terminal"
      },
      {
        "assignment": {
          "member": true,
          "training": false,
          "itemAvailable": true
        },
        "path": [
          "membership",
          "training",
          "learn"
        ],
        "edges": [
          "member-yes",
          "trained-no"
        ],
        "node": "learn",
        "matchingEdges": [],
        "outcome": "terminal"
      },
      {
        "assignment": {
          "member": false,
          "training": true,
          "itemAvailable": true
        },
        "path": [
          "membership",
          "join"
        ],
        "edges": [
          "member-no"
        ],
        "node": "join",
        "matchingEdges": [],
        "outcome": "terminal"
      },
      {
        "assignment": {
          "member": true,
          "training": true,
          "itemAvailable": true
        },
        "path": [
          "membership",
          "training",
          "stock",
          "borrow"
        ],
        "edges": [
          "member-yes",
          "trained-yes",
          "stock-yes"
        ],
        "node": "borrow",
        "matchingEdges": [],
        "outcome": "terminal"
      }
    ],
    "findings": [],
    "reached": [
      "membership",
      "join",
      "training",
      "learn",
      "stock",
      "wait",
      "borrow"
    ]
  }
}
```
