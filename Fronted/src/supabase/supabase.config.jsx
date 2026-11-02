// ⚠️ DEPRECATED: Este archivo ya no se usa después de la migración a MySQL/Backend.
// Se conserva un stub para no romper imports viejos como useSupabaseSubscription.

export const supabase = {
	channel: () => ({
		on: () => ({
			subscribe: () => ({}),
		}),
	}),
	removeChannel: () => {},
};