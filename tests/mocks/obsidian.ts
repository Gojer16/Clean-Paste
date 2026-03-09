import { vi } from "vitest";

export class Plugin {
	app: any;
	manifest: any;
	addCommand = vi.fn();
	addRibbonIcon = vi.fn((_icon, _title, callback) => callback);
	addSettingTab = vi.fn();
	loadData = vi.fn(async () => null);
	saveData = vi.fn(async () => undefined);

	constructor(app: any, manifest: any) {
		this.app = app;
		this.manifest = manifest;
	}
}

export class PluginSettingTab {
	app: any;
	plugin: any;
	containerEl: HTMLElement & {
		createEl: (tagName: string, options?: { text?: string }) => HTMLElement;
		empty: () => void;
	};

	constructor(app: any, plugin: any) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = createContainerEl();
	}
}

export class Setting {
	static instances: Setting[] = [];
	containerEl: HTMLElement;
	name = "";
	description = "";
	toggle: { onChangeHandler?: (value: boolean) => Promise<void> | void; value?: boolean } = {};

	constructor(containerEl: HTMLElement) {
		this.containerEl = containerEl;
		Setting.instances.push(this);
	}

	setName(name: string) {
		this.name = name;
		this.containerEl.appendChild(document.createTextNode(name));
		return this;
	}

	setDesc(description: string) {
		this.description = description;
		this.containerEl.appendChild(document.createTextNode(description));
		return this;
	}

	addToggle(
		callback: (toggle: {
			setValue: (value: boolean) => any;
			onChange: (handler: (value: boolean) => Promise<void> | void) => any;
		}) => void,
	) {
		const toggleApi = {
			setValue: (value: boolean) => {
				this.toggle.value = value;
				return toggleApi;
			},
			onChange: (handler: (value: boolean) => Promise<void> | void) => {
				this.toggle.onChangeHandler = handler;
				return toggleApi;
			},
		};
		callback(toggleApi);
		return this;
	}
}

export class Notice {
	static messages: string[] = [];

	constructor(message: string) {
		Notice.messages.push(message);
	}
}

export class MarkdownView {
	editor: unknown;

	constructor(editor: unknown) {
		this.editor = editor;
	}
}

export function resetObsidianMocks(): void {
	Notice.messages.length = 0;
	Setting.instances.length = 0;
}

function createContainerEl(): HTMLElement & {
	createEl: (tagName: string, options?: { text?: string }) => HTMLElement;
	empty: () => void;
} {
	const containerEl = document.createElement("div") as HTMLElement & {
		createEl: (tagName: string, options?: { text?: string }) => HTMLElement;
		empty: () => void;
	};

	containerEl.empty = () => {
		containerEl.replaceChildren();
	};

	containerEl.createEl = (tagName: string, options?: { text?: string }) => {
		const element = document.createElement(tagName);
		if (options?.text) {
			element.textContent = options.text;
		}
		containerEl.appendChild(element);
		return element;
	};

	return containerEl;
}
