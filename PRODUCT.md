# PathProof
register: product

PathProof helps small teams test the decision rules behind an intake form, borrowing process, or approval flow before people get stuck. Its central object is the actual finite workflow, not a dashboard. Users can see every route, select a counterexample, replay the exact input assignment and node path, change the model, and rerun the audit.

The first-use story is a deliberately broken library equipment borrowing workflow. The checker enumerates all eight combinations of three fixed boolean inputs. A visible repair adds the missing untrained-member route; the next run demonstrates the changed result. A clean example and a cycle example teach the semantics. Users can bring their own model through validated JSON, edit labels directly, and export the complete model and audit evidence.

Positioning: bounded exhaustive checking, not a guarantee about real-world systems. Inputs remain fixed through a run. Decisions with multiple matching edges stop as ambiguous; no priority is assumed. Reachability means reached on at least one unambiguous execution. There is no backend, runtime AI, account, tracking, or paid API. Never disguise sample data as observed user activity. Tone: direct, curious, precise. Success: demonstrate failure, inspect witness, perform auditable repair, rerun clear, export evidence in under three minutes.
