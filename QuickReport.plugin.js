/**
 * @name QuickReport
 * @author Zu / Xion
 * @authorId 884217130923487232
 * @version 2.0.2
 * @description Helps (mainly bun) stab scammers
 * @invite recover
 * @source https://github.com/Zuriix/SRC/blob/main/QuickReport.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Zuriix/SRC/main/QuickReport.plugin.js
 */

module.exports = (_ => {
	const changeLog = {};
	return !window.BDFDB_Global || (!(window.BDFDB_Global.loaded || window.BDFDB_Global.started)) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () { return this.name; }
		getAuthor () { return this.author; }
		getVersion () { return this.version; }
		getDescription () { return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`; }
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode === 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		load () {
			if (!(window.BDFDB_Global && Array.isArray(window.BDFDB_Global.pluginQueue))) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {window.BDFDB_Global.downloadModal = undefined;},
					onConfirm: _ => {
						window.BDFDB_Global.downloadModal = undefined;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () { this.load(); }
		stop () {}
		getSettingsPanel () {}
	} : (([Plugin, BDFDB]) => {
		return class QuickReport extends Plugin {
			onLoad () {
				this.modulePatches = {
					after: [
						"MessageActionsContextMenu",
						"MessageToolbar"
					]
				};
			}
			onStart () {}
			onStop () {}
			onMessageContextMenu (e) {
				if(e.instance.props.channel){
					let channel = e.instance.props.channel;
					if(channel.guild_id){
						let guild = BDFDB.LibraryStores.GuildStore.getGuild(channel.guild_id);
						let vanity = guild.vanityURLCode;
						let owner = BDFDB.LibraryStores.UserStore.getUser(guild.ownerId)
						if (e.instance.props.message) {
							let message = e.instance.props.message;
							let message_url = `https://discord.com/channels/${guild.id}/${channel.id}/${message.id}`
							let component = message.components[0] ? message.components[0].components[0] : null;
							let author = message.author;
							let toInject = BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: "No Embed Found!",
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "report"),
								icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, { icon: BDFDB.LibraryComponents.SvgIcon.Names.WARNING })
							});
							if(message.embeds.length === 1){
								let embed = message.embeds[0];
								console.log({
									channel: channel,
									guild: guild,
									guild_owner: owner,
									vanity: vanity,
									message: message,
									message_url: message_url,
									message_author: author,
									embed: embed,
									verify_component: component
								});
								toInject = BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
									label: "Create Report",
									id: BDFDB.ContextMenuUtils.createItemId(this.name, "report"),
									icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, { icon: BDFDB.LibraryComponents.SvgIcon.Names.DOWNLOAD }),
									action: _ => {
										BDFDB.LibraryModules.WindowUtils.copy("Failed to copy, check devtools for errors!");
										let output = `**WARNING:** This is a scam server.
Note: **Please do not** harass users with hoisted roles, they're usually given out to pin blame on unrelated members.
\`\`\`
Link: ${vanity?"\nVanity: .gg/"+vanity:""}
Type: ${component?"qr":""}
--
Guild: ${guild.name} (ID: ${guild.id})
Owner: ${owner.username}#${owner.discriminator} (ID: ${owner.id})
Fake Verify Bot: ${author.username}#${author.discriminator} (ID: ${author.id})
Fake Verify Message: ${message_url}
\`\`\``
										console.log(output);
										BDFDB.LibraryModules.WindowUtils.copy(output);

										if(BDFDB.LibraryModules.WindowUtils.readClipboard() === output){
											BDFDB.NotificationUtils.toast("Copied to clipboard!");
										} else {
											BDFDB.NotificationUtils.toast("Failed to copy to clipboard!?");
										}
									}
							});
						}
						let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id"});
						children.splice(index > -1 ? index + 1 : children.length, 0, toInject);
					}
					}
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
