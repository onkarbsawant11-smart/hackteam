const yearElement = document.querySelector("#current-year");
const themeToggle = document.querySelector("#theme-toggle");
const siteNameHeader = document.querySelector("#site-name-header");
const siteNameFooter = document.querySelector("#site-name-footer");
const siteIdentityForm = document.querySelector("#site-identity-form");
const siteNameSize = document.querySelector("#site-name-size");
const siteNameSizeValue = document.querySelector("#site-name-size-value");
const identityStatus = document.querySelector("#identity-status");
const adminDialog = document.querySelector("#admin-dialog");
const adminTrigger = document.querySelector("#admin-trigger");
const dialogCloseButtons = document.querySelectorAll(".dialog-close");
const adminLoginForm = document.querySelector("#admin-login-form");
const adminLoginStatus = document.querySelector("#admin-login-status");
const adminLoginView = document.querySelector("#admin-login-view");
const adminPanelView = document.querySelector("#admin-panel-view");
const adminSignOut = document.querySelector("#admin-sign-out");
const adminCredentialsForm = document.querySelector("#admin-credentials-form");
const adminCredentialsStatus = document.querySelector("#admin-credentials-status");
const profileForm = document.querySelector("#profile-form");
const profileList = document.querySelector("#admin-profile-list");
const profileCount = document.querySelector("#profile-count");
const profileFormTitle = document.querySelector("#profile-form-title");
const profileSave = document.querySelector("#profile-save");
const profileCancel = document.querySelector("#profile-cancel");
const profileStatus = document.querySelector("#admin-status");
const projectForm = document.querySelector("#project-form");
const projectList = document.querySelector("#admin-project-list");
const projectCount = document.querySelector("#project-count");
const projectFormTitle = document.querySelector("#project-form-title");
const projectSave = document.querySelector("#project-save");
const projectCancel = document.querySelector("#project-cancel");
const projectStatus = document.querySelector("#project-status");
const textSectionForm = document.querySelector("#text-section-form");
const textSectionList = document.querySelector("#admin-text-section-list");
const textSectionCount = document.querySelector("#text-section-count");
const textSectionFormTitle = document.querySelector("#text-section-form-title");
const textSectionSave = document.querySelector("#text-section-save");
const textSectionCancel = document.querySelector("#text-section-cancel");
const textSectionStatus = document.querySelector("#text-section-status");
const deployButton = document.querySelector("#deploy-profiles");
const deployStatus = document.querySelector("#deploy-status");
const teamGrid = document.querySelector("#team-grid");
const projectsSection = document.querySelector("#projects");
const projectGrid = document.querySelector("#project-grid");
const landingTextSections = document.querySelector("#landing-text-sections");

const starterProfiles = [
	{ id: "starter-alex", name: "Alex Morgan", role: "Project Lead", branch: "Main Office", email: "alex@example.invalid", photo: "" },
	{ id: "starter-jordan", name: "Jordan Lee", role: "Designer", branch: "Main Office", email: "jordan@example.invalid", photo: "" },
	{ id: "starter-sam", name: "Sam Rivera", role: "Developer", branch: "Main Office", email: "sam@example.invalid", photo: "" }
];

const draftStorageKey = "team-site-profile-drafts";
const publishedStorageKey = "team-site-published-profiles";
const projectDraftStorageKey = "team-site-project-drafts";
const publishedProjectStorageKey = "team-site-published-projects";
const textSectionDraftStorageKey = "team-site-text-section-drafts";
const publishedTextSectionStorageKey = "team-site-published-text-sections";
const siteIdentityStorageKey = "team-site-identity";
const supabaseConfig = window.SUPABASE_CONFIG || {};
const supabaseConfigured = typeof supabaseConfig.url === "string"
	&& supabaseConfig.url.startsWith("https://")
	&& typeof supabaseConfig.anonKey === "string"
	&& !supabaseConfig.anonKey.startsWith("YOUR_");
const supabaseClient = supabaseConfigured && window.supabase
	? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
	: null;

function getStoredValue(key) {
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
}

function setStoredValue(key, value) {
	try {
		window.localStorage.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}

function removeStoredValue(key) {
	try {
		window.localStorage.removeItem(key);
	} catch {
		return false;
	}
	return true;
}

removeStoredValue("team-site-admin-credentials");
const brandFonts = {
	serif: 'Georgia, "Times New Roman", serif',
	trebuchet: '"Trebuchet MS", sans-serif',
	sans: "Arial, sans-serif",
	mono: '"Courier New", monospace'
};
let draftProfiles = loadProfiles(draftStorageKey) || loadProfiles(publishedStorageKey) || starterProfiles;
let draftProjects = loadProfiles(projectDraftStorageKey) || loadProfiles(publishedProjectStorageKey) || [];
let draftTextSections = loadProfiles(textSectionDraftStorageKey) || loadProfiles(publishedTextSectionStorageKey) || [];

function getSupabaseUnavailableMessage() {
	if (!supabaseConfigured) return "Supabase is not configured. Add the project URL and public anon key in supabase-config.js.";
	return "Supabase client failed to load. Check the browser's internet access and reload the page.";
}

function loadSiteIdentity() {
	try {
		const storedIdentity = JSON.parse(getStoredValue(siteIdentityStorageKey));
		if (!storedIdentity || typeof storedIdentity !== "object") return null;
		return {
			name: typeof storedIdentity.name === "string" && storedIdentity.name.trim() ? storedIdentity.name.trim() : "Our Team",
			font: Object.hasOwn(brandFonts, storedIdentity.font) ? storedIdentity.font : "serif",
			size: Math.min(40, Math.max(16, Number(storedIdentity.size) || 22))
		};
	} catch {
		return null;
	}
}

function applySiteIdentity(identity) {
	if (siteNameHeader) {
		siteNameHeader.textContent = identity.name;
		siteNameHeader.style.fontFamily = brandFonts[identity.font];
		siteNameHeader.style.fontSize = `${identity.size}px`;
	}
	if (siteNameFooter) siteNameFooter.textContent = identity.name;
	document.title = identity.name;
}

let siteIdentity = loadSiteIdentity() || { name: "Our Team", font: "serif", size: 22 };
applySiteIdentity(siteIdentity);

if (yearElement) {
	yearElement.textContent = new Date().getFullYear();
}

if (siteIdentityForm && siteNameSize && siteNameSizeValue && identityStatus) {
	siteIdentityForm.elements.name.value = siteIdentity.name;
	siteIdentityForm.elements.font.value = siteIdentity.font;
	siteNameSize.value = String(siteIdentity.size);
	siteNameSizeValue.value = `${siteIdentity.size} px`;
	siteNameSize.addEventListener("input", () => {
		siteNameSizeValue.value = `${siteNameSize.value} px`;
	});
	siteIdentityForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const formData = new FormData(siteIdentityForm);
		const updatedIdentity = {
			name: String(formData.get("name")).trim(),
			font: String(formData.get("font")),
			size: Number(formData.get("size"))
		};
		if (!setStoredValue(siteIdentityStorageKey, JSON.stringify(updatedIdentity))) {
			identityStatus.textContent = "Could not save the website identity in this browser.";
			return;
		}
		siteIdentity = updatedIdentity;
		applySiteIdentity(siteIdentity);
		identityStatus.textContent = "Identity saved as a draft. Deploy changes to publish it.";
	});
}

function loadProfiles(storageKey) {
	try {
		const storedProfiles = getStoredValue(storageKey);
		if (!storedProfiles) return null;
		const parsedProfiles = JSON.parse(storedProfiles);
		return Array.isArray(parsedProfiles) ? parsedProfiles : null;
	} catch {
		return null;
	}
}

function saveProfiles(storageKey, profiles) {
	return setStoredValue(storageKey, JSON.stringify(profiles));
}

async function fetchSiteContent() {
	if (!supabaseClient) throw new Error(getSupabaseUnavailableMessage());
	const { data, error } = await supabaseClient
		.from("site_content")
		.select("site_identity, profiles, projects, text_sections")
		.eq("id", "main")
		.maybeSingle();
	if (error) throw error;
	if (!data) throw new Error("Site content is missing. Run supabase/schema.sql in the Supabase SQL Editor.");
	return data;
}

function renderPublishedSiteContent(content) {
	if (content.site_identity && typeof content.site_identity === "object") {
		siteIdentity = content.site_identity;
		applySiteIdentity(siteIdentity);
	}
	renderTeam(Array.isArray(content.profiles) ? content.profiles : []);
	renderProjects(Array.isArray(content.projects) ? content.projects : []);
	renderLandingTextSections(Array.isArray(content.text_sections) ? content.text_sections : []);
}

async function loadAdminDraftsFromSupabase() {
	const content = await fetchSiteContent();
	const hasRemoteContent = [content.profiles, content.projects, content.text_sections]
		.some((items) => Array.isArray(items) && items.length > 0);
	siteIdentity = !hasRemoteContent && loadSiteIdentity()
		? loadSiteIdentity()
		: content.site_identity || siteIdentity;
	applySiteIdentity(siteIdentity);
	if (siteIdentityForm) {
		siteIdentityForm.elements.name.value = siteIdentity.name;
		siteIdentityForm.elements.font.value = siteIdentity.font;
		siteNameSize.value = String(siteIdentity.size);
		siteNameSizeValue.value = `${siteIdentity.size} px`;
	}
	const legacyProfiles = loadProfiles(draftStorageKey) || loadProfiles(publishedStorageKey);
	const legacyProjects = loadProfiles(projectDraftStorageKey) || loadProfiles(publishedProjectStorageKey);
	const legacyTextSections = loadProfiles(textSectionDraftStorageKey) || loadProfiles(publishedTextSectionStorageKey);
	draftProfiles = Array.isArray(content.profiles) && content.profiles.length ? content.profiles : legacyProfiles || starterProfiles;
	draftProjects = Array.isArray(content.projects) && content.projects.length ? content.projects : legacyProjects || [];
	draftTextSections = Array.isArray(content.text_sections) && content.text_sections.length ? content.text_sections : legacyTextSections || [];
	saveProfiles(draftStorageKey, draftProfiles);
	saveProfiles(projectDraftStorageKey, draftProjects);
	saveProfiles(textSectionDraftStorageKey, draftTextSections);
	return content;
}

function makeElement(tagName, className, text) {
	const element = document.createElement(tagName);
	if (className) element.className = className;
	if (text !== undefined) element.textContent = text;
	return element;
}

function makeExternalLink(url, text, className) {
	try {
		const parsedUrl = new URL(url);
		if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") return null;
		const link = makeElement("a", className, text);
		link.href = parsedUrl.href;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		return link;
	} catch {
		return null;
	}
}

function createPortrait(profile, index) {
	if (profile.photo) {
		const image = makeElement("img", "portrait portrait-image");
		image.src = profile.photo;
		image.alt = `${profile.name}'s photo`;
		return image;
	}
	const color = ["one", "two", "three"][index % 3];
	return makeElement("div", `portrait portrait-${color}`, profile.name.trim().charAt(0).toUpperCase());
}

function renderTeam(profiles) {
	if (!teamGrid) return;
	teamGrid.replaceChildren();
	profiles.forEach((profile, index) => {
		const card = makeElement("article", "team-member");
		card.append(createPortrait(profile, index));
		card.append(makeElement("h3", "", profile.name));
		card.append(makeElement("p", "team-role", profile.role));
		card.append(makeElement("p", "team-branch", profile.branch));
		const email = makeElement("a", "team-email", profile.email);
		email.href = `mailto:${profile.email}`;
		card.append(email);
		const linkedin = makeExternalLink(profile.linkedin, "LinkedIn", "team-linkedin");
		if (linkedin) card.append(linkedin);
		teamGrid.append(card);
	});
}

function renderProjects(projects) {
	if (!projectsSection || !projectGrid) return;
	projectGrid.replaceChildren();
	projectsSection.hidden = projects.length === 0;
	projects.forEach((project) => {
		const card = makeElement("article", "project-card");
		card.append(makeElement("h3", "", project.name));
		card.append(makeElement("p", "project-problem", project.problem));
		if (project.solution) card.append(makeElement("p", "", project.solution));
		const link = makeExternalLink(project.link, "View project", "project-card-link");
		if (link) card.append(link);
		projectGrid.append(card);
	});
}

function renderLandingTextSections(sections) {
	if (!landingTextSections) return;
	landingTextSections.replaceChildren();
	sections.forEach((item, index) => {
		const layout = ["editorial", "centered", "quote"].includes(item.layout) ? item.layout : "editorial";
		const section = makeElement("section", `section custom-text-section text-layout-${layout}`);
		section.id = `landing-text-${index + 1}`;
		section.setAttribute("aria-labelledby", `${section.id}-heading`);
		const content = makeElement("div", "text-block-inner");
		content.append(makeElement("p", "eyebrow", "A thought for what's next"));
		const heading = makeElement("h2", "", item.title);
		heading.id = `${section.id}-heading`;
		content.append(heading);
		content.append(makeElement(layout === "quote" ? "blockquote" : "p", "custom-text-copy", item.body));
		section.append(content);
		landingTextSections.append(section);
	});
}

function renderAdminProfiles() {
	if (!profileList || !profileCount) return;
	profileList.replaceChildren();
	profileCount.textContent = String(draftProfiles.length);
	draftProfiles.forEach((profile) => {
		const row = makeElement("article", "admin-profile-row");
		const details = makeElement("div", "admin-profile-details");
		details.append(makeElement("strong", "", profile.name));
		details.append(makeElement("span", "", `${profile.role} · ${profile.branch}`));
		const actions = makeElement("div", "admin-profile-actions");
		const editButton = makeElement("button", "admin-quiet-button", "Edit");
		editButton.type = "button";
		editButton.addEventListener("click", () => editProfile(profile.id));
		const removeButton = makeElement("button", "admin-quiet-button", "Remove");
		removeButton.type = "button";
		removeButton.addEventListener("click", () => removeProfile(profile.id));
		actions.append(editButton, removeButton);
		row.append(details, actions);
		profileList.append(row);
	});
}

function renderAdminProjects() {
	if (!projectList || !projectCount) return;
	projectList.replaceChildren();
	projectCount.textContent = String(draftProjects.length);
	draftProjects.forEach((project) => {
		const row = makeElement("article", "admin-project-row");
		const details = makeElement("div", "admin-project-details");
		details.append(makeElement("strong", "", project.name));
		details.append(makeElement("span", "", project.problem));
		const actions = makeElement("div", "admin-project-actions");
		const editButton = makeElement("button", "admin-quiet-button", "Edit");
		editButton.type = "button";
		editButton.addEventListener("click", () => editProject(project.id));
		const removeButton = makeElement("button", "admin-quiet-button", "Remove");
		removeButton.type = "button";
		removeButton.addEventListener("click", () => removeProject(project.id));
		actions.append(editButton, removeButton);
		row.append(details, actions);
		projectList.append(row);
	});
}

function renderAdminTextSections() {
	if (!textSectionList || !textSectionCount) return;
	textSectionList.replaceChildren();
	textSectionCount.textContent = String(draftTextSections.length);
	draftTextSections.forEach((item) => {
		const row = makeElement("article", "admin-text-row");
		const details = makeElement("div", "admin-text-details");
		const layoutName = { editorial: "Editorial", centered: "Centered", quote: "Quote highlight" }[item.layout] || "Editorial";
		details.append(makeElement("strong", "", item.title));
		details.append(makeElement("span", "", layoutName));
		const actions = makeElement("div", "admin-text-actions");
		const editButton = makeElement("button", "admin-quiet-button", "Edit");
		editButton.type = "button";
		editButton.addEventListener("click", () => editTextSection(item.id));
		const removeButton = makeElement("button", "admin-quiet-button", "Remove");
		removeButton.type = "button";
		removeButton.addEventListener("click", () => removeTextSection(item.id));
		actions.append(editButton, removeButton);
		row.append(details, actions);
		textSectionList.append(row);
	});
}

function persistDrafts() {
	if (!saveProfiles(draftStorageKey, draftProfiles)) {
		profileStatus.textContent = "Could not save drafts. The browser may be out of storage space.";
		return false;
	}
	return true;
}

function resetProfileForm() {
	profileForm.reset();
	profileForm.elements.id.value = "";
	profileFormTitle.textContent = "Add a profile";
	profileSave.textContent = "Add profile";
	profileCancel.hidden = true;
}

function editProfile(profileId) {
	const profile = draftProfiles.find((item) => item.id === profileId);
	if (!profile) return;
	profileForm.elements.id.value = profile.id;
	profileForm.elements.name.value = profile.name;
	profileForm.elements.role.value = profile.role;
	profileForm.elements.branch.value = profile.branch;
	profileForm.elements.email.value = profile.email;
	profileForm.elements.linkedin.value = profile.linkedin || "";
	profileFormTitle.textContent = "Edit profile";
	profileSave.textContent = "Save changes";
	profileCancel.hidden = false;
	profileStatus.textContent = "";
	profileForm.elements.name.focus();
}

function removeProfile(profileId) {
	draftProfiles = draftProfiles.filter((profile) => profile.id !== profileId);
	persistDrafts();
	renderAdminProfiles();
	resetProfileForm();
	deployStatus.textContent = "Changes are drafts until deployed.";
}

function persistProjectDrafts() {
	if (!saveProfiles(projectDraftStorageKey, draftProjects)) {
		projectStatus.textContent = "Could not save project drafts. The browser may be out of storage space.";
		return false;
	}
	return true;
}

function resetProjectForm() {
	projectForm.reset();
	projectForm.elements.id.value = "";
	projectFormTitle.textContent = "Add a project";
	projectSave.textContent = "Add project";
	projectCancel.hidden = true;
}

function editProject(projectId) {
	const project = draftProjects.find((item) => item.id === projectId);
	if (!project) return;
	projectForm.elements.id.value = project.id;
	projectForm.elements.name.value = project.name;
	projectForm.elements.problem.value = project.problem;
	projectForm.elements.link.value = project.link || "";
	projectForm.elements.solution.value = project.solution || "";
	projectFormTitle.textContent = "Edit project";
	projectSave.textContent = "Save changes";
	projectCancel.hidden = false;
	projectStatus.textContent = "";
	projectForm.elements.name.focus();
}

function removeProject(projectId) {
	draftProjects = draftProjects.filter((project) => project.id !== projectId);
	persistProjectDrafts();
	renderAdminProjects();
	resetProjectForm();
	deployStatus.textContent = "Changes are drafts until deployed.";
}

function persistTextSectionDrafts() {
	if (!saveProfiles(textSectionDraftStorageKey, draftTextSections)) {
		textSectionStatus.textContent = "Could not save text-section drafts. The browser may be out of storage space.";
		return false;
	}
	return true;
}

function resetTextSectionForm() {
	textSectionForm.reset();
	textSectionForm.elements.id.value = "";
	textSectionFormTitle.textContent = "Add a text section";
	textSectionSave.textContent = "Add text section";
	textSectionCancel.hidden = true;
}

function editTextSection(sectionId) {
	const item = draftTextSections.find((section) => section.id === sectionId);
	if (!item) return;
	textSectionForm.elements.id.value = item.id;
	textSectionForm.elements.title.value = item.title;
	textSectionForm.elements.body.value = item.body;
	textSectionForm.elements.layout.value = item.layout;
	textSectionFormTitle.textContent = "Edit text section";
	textSectionSave.textContent = "Save changes";
	textSectionCancel.hidden = false;
	textSectionStatus.textContent = "";
	textSectionForm.elements.title.focus();
}

function removeTextSection(sectionId) {
	draftTextSections = draftTextSections.filter((item) => item.id !== sectionId);
	if (!persistTextSectionDrafts()) return;
	renderAdminTextSections();
	resetTextSectionForm();
	deployStatus.textContent = "Changes are drafts until deployed.";
}

function readPhoto(file) {
	return new Promise((resolve, reject) => {
		if (file.size > 8 * 1024 * 1024) {
			reject(new Error("Choose a photo smaller than 8 MB."));
			return;
		}
		const reader = new FileReader();
		reader.addEventListener("load", () => resolve(reader.result));
		reader.addEventListener("error", () => reject(new Error("Could not read that photo.")));
		reader.readAsDataURL(file);
	});
}

renderTeam(supabaseConfigured ? starterProfiles : loadProfiles(publishedStorageKey) || starterProfiles);
renderProjects(supabaseConfigured ? [] : loadProfiles(publishedProjectStorageKey) || []);
renderLandingTextSections(supabaseConfigured ? [] : loadProfiles(publishedTextSectionStorageKey) || []);

if (supabaseClient) {
	fetchSiteContent().then(renderPublishedSiteContent).catch((error) => {
		console.error("Could not load published Supabase site content:", error.message);
	});
}

if (themeToggle) {
	const savedTheme = getStoredValue("team-site-theme");
	const initialTheme = savedTheme === "black" ? "black" : "white";
	document.body.dataset.theme = initialTheme;
	themeToggle.checked = initialTheme === "black";
	if (savedTheme !== initialTheme) setStoredValue("team-site-theme", initialTheme);

	themeToggle.addEventListener("change", () => {
		const selectedTheme = themeToggle.checked ? "black" : "white";
		document.body.dataset.theme = selectedTheme;
		setStoredValue("team-site-theme", selectedTheme);
	});
}

if (adminDialog && adminTrigger && adminLoginForm && adminLoginView && adminPanelView) {
	adminLoginForm.elements.username.value = supabaseConfig.adminUsername || "onkarbsawant11@gmail.com";
	const showAdminPanel = async () => {
		try {
			const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
			if (userError || !user) throw new Error("Please sign in with your Supabase administrator account.");
			const { data: adminRecord, error: adminError } = await supabaseClient
				.from("site_admins")
				.select("user_id, username")
				.eq("user_id", user.id)
				.maybeSingle();
			if (adminError || !adminRecord) throw new Error("This account is not authorized. Add its user ID to site_admins in Supabase.");
			if (adminRecord.username !== "onkarbsawant11@gmail.com") {
				throw new Error("The configured admin username does not match the permanent username. Update the site_admins record in Supabase.");
			}
			await loadAdminDraftsFromSupabase();
		} catch (error) {
			if (adminLoginStatus) adminLoginStatus.textContent = error.message;
			await supabaseClient.auth.signOut();
			return;
		}
		adminLoginView.hidden = true;
		adminPanelView.hidden = false;
		renderAdminProfiles();
		renderAdminProjects();
		renderAdminTextSections();
		profileForm.elements.name.focus();
	};
	adminTrigger.addEventListener("click", async () => {
		adminDialog.showModal();
		if (!supabaseClient) {
			if (adminLoginStatus) adminLoginStatus.textContent = getSupabaseUnavailableMessage();
			return;
		}
		const { data: { session } } = await supabaseClient.auth.getSession();
		if (session) await showAdminPanel();
	});
	dialogCloseButtons.forEach((button) => button.addEventListener("click", () => adminDialog.close()));
	adminDialog.addEventListener("click", (event) => {
		if (event.target === adminDialog) adminDialog.close();
	});
	adminDialog.addEventListener("close", () => {
		adminPanelView.hidden = true;
		adminLoginView.hidden = false;
		adminLoginForm.reset();
		adminLoginForm.elements.username.value = supabaseConfig.adminUsername || "onkarbsawant11@gmail.com";
		if (adminLoginStatus) adminLoginStatus.textContent = "";
	});
	adminLoginForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		if (adminLoginStatus) adminLoginStatus.textContent = "";
		if (!supabaseClient) {
			if (adminLoginStatus) adminLoginStatus.textContent = getSupabaseUnavailableMessage();
			return;
		}
		const formData = new FormData(adminLoginForm);
		const username = String(formData.get("username")).trim().toLowerCase();
		if (username !== "onkarbsawant11@gmail.com") {
			adminLoginStatus.textContent = "This is not the configured permanent admin username.";
			return;
		}
		const password = String(formData.get("password"));
		const { data, error } = await supabaseClient.functions.invoke("admin-login", { body: { username, password } });
		if (error) {
			if (error.name === "FunctionsHttpError" && error.context instanceof Response) {
				try {
					const responseBody = await error.context.json();
					adminLoginStatus.textContent = responseBody.error || "The Supabase login function rejected the request.";
				} catch {
					adminLoginStatus.textContent = "The Supabase login function returned an unreadable error.";
				}
			} else if (error.name === "FunctionsFetchError" || error.name === "FunctionsRelayError") {
				adminLoginStatus.textContent = "Could not reach the Supabase login function. Confirm it is deployed and the project URL/key are correct.";
			} else {
				adminLoginStatus.textContent = "Username or password is incorrect.";
			}
			return;
		}
		if (!data?.session?.access_token || !data?.session?.refresh_token) {
			adminLoginStatus.textContent = "The authentication service returned an invalid session.";
			return;
		}
		const { error: sessionError } = await supabaseClient.auth.setSession(data.session);
		if (sessionError) {
			adminLoginStatus.textContent = "Could not establish a secure session.";
			return;
		}
		adminLoginForm.elements.username.value = username;
		await showAdminPanel();
	});
	adminSignOut.addEventListener("click", async () => {
		if (supabaseClient) await supabaseClient.auth.signOut();
		adminDialog.close();
	});
	adminCredentialsForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		adminCredentialsStatus.textContent = "";
		if (!supabaseClient) {
			adminCredentialsStatus.textContent = getSupabaseUnavailableMessage();
			return;
		}
		const formData = new FormData(adminCredentialsForm);
		const currentPassword = String(formData.get("currentPassword"));
		const newPassword = String(formData.get("newPassword"));
		const confirmPassword = String(formData.get("confirmPassword"));
		const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
		if (userError || !user?.email) {
			adminCredentialsStatus.textContent = "Your session expired. Sign in again before changing your password.";
			return;
		}
		const { error: verificationError } = await supabaseClient.auth.signInWithPassword({ email: user.email, password: currentPassword });
		if (verificationError) {
			adminCredentialsStatus.textContent = "Current password is incorrect.";
			return;
		}
		if (newPassword.length < 8 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
			adminCredentialsStatus.textContent = "Choose at least 8 characters with a lowercase letter, uppercase letter, and digit.";
			return;
		}
		if (newPassword !== confirmPassword) {
			adminCredentialsStatus.textContent = "The new password and confirmation do not match.";
			return;
		}
		const { error: updateError } = await supabaseClient.auth.updateUser({ password: newPassword });
		if (updateError) {
			adminCredentialsStatus.textContent = updateError.message;
			return;
		}
		adminCredentialsForm.reset();
		adminCredentialsStatus.textContent = "Supabase account password updated.";
	});
	profileCancel.addEventListener("click", resetProfileForm);
	profileForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		profileStatus.textContent = "";
		const formData = new FormData(profileForm);
		const existingProfile = draftProfiles.find((profile) => profile.id === formData.get("id"));
		let photo = existingProfile?.photo || "";
		const photoFile = formData.get("photo");
		if (photoFile instanceof File && photoFile.size > 0) {
			try {
				photo = await readPhoto(photoFile);
			} catch (error) {
				profileStatus.textContent = error.message;
				return;
			}
		}
		const profile = {
			id: existingProfile?.id || globalThis.crypto?.randomUUID?.() || `profile-${Date.now()}`,
			name: String(formData.get("name")).trim(),
			role: String(formData.get("role")).trim(),
			branch: String(formData.get("branch")).trim(),
			email: String(formData.get("email")).trim(),
			linkedin: String(formData.get("linkedin")).trim(),
			photo
		};
		if (existingProfile) {
			draftProfiles = draftProfiles.map((item) => item.id === profile.id ? profile : item);
		} else {
			draftProfiles.push(profile);
		}
		if (!persistDrafts()) return;
		renderAdminProfiles();
		resetProfileForm();
		profileStatus.textContent = existingProfile ? "Profile updated in drafts." : "Profile added to drafts.";
		deployStatus.textContent = "Changes are drafts until deployed.";
	});
	projectCancel.addEventListener("click", resetProjectForm);
	projectForm.addEventListener("submit", (event) => {
		event.preventDefault();
		projectStatus.textContent = "";
		const formData = new FormData(projectForm);
		const existingProject = draftProjects.find((project) => project.id === formData.get("id"));
		const project = {
			id: existingProject?.id || globalThis.crypto?.randomUUID?.() || `project-${Date.now()}`,
			name: String(formData.get("name")).trim(),
			problem: String(formData.get("problem")).trim(),
			link: String(formData.get("link")).trim(),
			solution: String(formData.get("solution")).trim()
		};
		if (existingProject) {
			draftProjects = draftProjects.map((item) => item.id === project.id ? project : item);
		} else {
			draftProjects.push(project);
		}
		if (!persistProjectDrafts()) return;
		renderAdminProjects();
		resetProjectForm();
		projectStatus.textContent = existingProject ? "Project updated in drafts." : "Project added to drafts.";
		deployStatus.textContent = "Changes are drafts until deployed.";
	});
	textSectionCancel.addEventListener("click", resetTextSectionForm);
	textSectionForm.addEventListener("submit", (event) => {
		event.preventDefault();
		textSectionStatus.textContent = "";
		const formData = new FormData(textSectionForm);
		const existingItem = draftTextSections.find((item) => item.id === formData.get("id"));
		const item = {
			id: existingItem?.id || globalThis.crypto?.randomUUID?.() || `text-${Date.now()}`,
			title: String(formData.get("title")).trim(),
			body: String(formData.get("body")).trim(),
			layout: ["editorial", "centered", "quote"].includes(String(formData.get("layout"))) ? String(formData.get("layout")) : "editorial"
		};
		if (existingItem) {
			draftTextSections = draftTextSections.map((entry) => entry.id === item.id ? item : entry);
		} else {
			draftTextSections.push(item);
		}
		if (!persistTextSectionDrafts()) return;
		renderAdminTextSections();
		resetTextSectionForm();
		textSectionStatus.textContent = existingItem ? "Text section updated in drafts." : "Text section added to drafts.";
		deployStatus.textContent = "Changes are drafts until deployed.";
	});
	deployButton.addEventListener("click", async () => {
		if (!supabaseClient) {
			deployStatus.textContent = getSupabaseUnavailableMessage();
			return;
		}
		deployStatus.textContent = "Publishing changes to Supabase…";
		const { data, error } = await supabaseClient
			.from("site_content")
			.upsert({
				id: "main",
				site_identity: siteIdentity,
				profiles: draftProfiles,
				projects: draftProjects,
				text_sections: draftTextSections,
				updated_at: new Date().toISOString()
			}, { onConflict: "id" })
			.select("site_identity, profiles, projects, text_sections")
			.single();
		if (error) {
			deployStatus.textContent = error.code === "42501"
				? "Supabase rejected this write. Confirm this account is listed in site_admins and RLS policies are installed."
				: `Deploy failed: ${error.message}`;
			return;
		}
		renderPublishedSiteContent(data);
		saveProfiles(draftStorageKey, draftProfiles);
		saveProfiles(projectDraftStorageKey, draftProjects);
		saveProfiles(textSectionDraftStorageKey, draftTextSections);
		deployStatus.textContent = `Published ${draftProfiles.length} profile${draftProfiles.length === 1 ? "" : "s"}, ${draftProjects.length} project${draftProjects.length === 1 ? "" : "s"}, and ${draftTextSections.length} text section${draftTextSections.length === 1 ? "" : "s"} to Supabase.`;
	});
}
