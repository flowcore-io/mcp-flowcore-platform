import fs from "node:fs";

/**
 * Interface for the configuration object
 */
interface Config {
	serviceAccountId?: string;
	serviceAccountKey?: string;
	[key: string]: string | number | boolean | object | undefined; // More specific type for additional properties
}

/**
 * Parse command-line arguments to extract configuration
 * Supports both --config="..." and --config path/to/file.json formats
 * @returns The parsed configuration object or null if not found
 */
export function parseConfig(): Config | null {
	const args = process.argv.slice(2);
	const configArg = args.find((arg) => arg.startsWith("--config"));

	if (!configArg) {
		return null;
	}

	try {
		let configValue: string | undefined;

		// Handle --config=value format
		if (configArg.includes("=")) {
			configValue = configArg.split("=")[1];
		}
		// Handle --config value format
		else {
			const configIndex = args.indexOf("--config");
			if (configIndex !== -1 && configIndex < args.length - 1) {
				configValue = args[configIndex + 1];
			}
		}

		if (!configValue) {
			return null;
		}

		// If it's a JSON string
		if (configValue.startsWith("{") || configValue.startsWith('"')) {
			return JSON.parse(configValue.replace(/^"|"$/g, ""));
		}

		// If it's a file path
		if (configValue.endsWith(".json")) {
			const content = fs.readFileSync(configValue, "utf-8");
			return JSON.parse(content);
		}

		return null;
	} catch (error) {
		console.error("Error parsing config:", error);
		return null;
	}
}
