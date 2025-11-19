import { RunService } from "@rbxts/services";

class StateMachine {
	private currentState = "" as string;
	private states = new Map<string, { Enter?: () => void; Exit?: () => void; Update?: () => void }>();

	private RunServiceConnection: undefined | RBXScriptConnection = undefined;

	SetState(stateName: string) {
		if (stateName === this.currentState) return;
		const current = this.states.get(this.currentState);
		if (current) if (current.Exit) current.Exit();
		const state = this.states.get(stateName);
		if (state !== undefined) {
			this.currentState = stateName;
			if (state.Enter) state.Enter();
			if (state.Exit) state.Exit();
		}
	}

	AddState(stateName: string, internals: { Enter?: () => void; Exit?: () => void; Update?: () => void }) {
		if (this.states.get(stateName)) return;
		this.states.set(stateName, internals);
	}

	DestroyMachine() {
		this.states.clear();
		if (this.RunServiceConnection !== undefined) {
			this.RunServiceConnection.Disconnect();
			this.RunServiceConnection = undefined;
		}
	}

	constructor() {
		this.RunServiceConnection = RunService.Stepped.Connect(() => {
			const state = this.states.get(this.currentState);
			if (state !== undefined) if (state.Update) state.Update();
		});
	}
}

export = StateMachine;
