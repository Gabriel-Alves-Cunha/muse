import {
	useVerifyNotTracking,
	useVerifyOneRender,
	useTraceListeners,
	useTraceUpdates,
} from "@legendapp/state/trace";

export const useTrace = (name: string) => {
	useVerifyNotTracking(name);
	useVerifyOneRender(name);
	useTraceListeners(name);
	useTraceUpdates(name);
}
