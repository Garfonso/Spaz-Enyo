enyo.kind({
	name: "Spaz.Entry",
	kind: "HFlexBox",
	flex: 1,
	events: {
		onEntryClick: "",
		onEntryHold: ""
	},
	published: {
		entry: "",
		ignoreUnread: false
	},
	components: [
		{className: "spaz-entry-item entry", kind: "Item", layoutKind: "HFlexLayout", onclick: "entryClick", onmousehold: "entryHold", flex: 1, tapHighlight: true, style: "padding-right: 5px;", components: [
			{kind: "Control", components: [
					{name: "authorAvatar", kind: "Image", width: "50px", height: "50px", className: "avatar"},
					{name: "reposterAvatar", kind: "Image", width: "25px", height: "25px", className: "small-avatar", showing: false}
			]},
			{name: "text", allowHtml: true, flex: 1, className: "entrytext text"}
		]}
	],

	entryChanged: function(){

		this.$.authorAvatar.setSrc(this.entry.author_avatar);

		var toMacroize = "<span height='13px' class='text username author'>{$author_username}</span>";

		this.$.reposterAvatar.setShowing(this.entry.is_repost);
		if (this.entry.recipient_username && this.entry.is_private_message) {
			toMacroize += "<span style='padding: 0px 3px; position: relative; bottom: 1px'>&rarr;</span>";
			toMacroize += "<span class = 'text username recipient author'>{$recipient_username}</span>";
		} else if(this.entry.is_repost === true){
			toMacroize += "<img height = '13px' class='entryHeaderIcon' src = 'source/images/reposted.png'></img>";
			toMacroize += "<span class='text username author'>{$reposter_username}</span>";
			this.$.reposterAvatar.setSrc(this.entry.reposter_avatar);
		}
		if(this.entry.author_is_private){
			toMacroize += "<img height = '13px' class='entryHeaderIcon' style='position: relative; top: 1px;' src = 'source/images/tiny-lock-icon.png'></img>";
		}

		if(this.entry.is_favorite){
			toMacroize += "<img height = '13px' class='entryHeaderIcon' style='position: relative; top: 1px;' src = 'source/images/favorited.png'></img>";
		}


		toMacroize += "<br/>";

		var entryBody = App.Cache.EntriesHTML.getItem(this.entry.spaz_id);
		if (!entryBody) {
			var entryText = this.entry.text;
			var urls = [];
			if(this.entry._orig.entities) {
				if(this.entry._orig.entities.urls) {
					urls = urls.concat(this.entry._orig.entities.urls);
				}
				if(this.entry._orig.entities.media) {
					urls = urls.concat(this.entry._orig.entities.media);
				}
			}
			if(this.entry._orig.retweeted_status && this.entry._orig.retweeted_status.entities && this.entry._orig.retweeted_status.entities.urls) {
				urls = urls.concat(this.entry._orig.retweeted_status.entities.urls);
			}
			for (var i = 0; i != urls.length; i++) {
				if(urls[i].expanded_url) {
					entryText = entryText.replace(urls[i].url, urls[i].expanded_url);
				}
			}
			entryBody = AppUtils.applyEntryTextFilters(entryText);
			App.Cache.EntriesHTML.setItem(this.entry.spaz_id, entryBody);
		}
		toMacroize += entryBody;
		toMacroize += "<br/>";

		if (this.entry.read === false && this.ignoreUnread === false ) {
			toMacroize += "<img align='left' src='source/images/unread.png' height= '13px' class='entryHeaderIcon'></img> ";
		}

		toMacroize += "<span class='small' height = '13px'>";
		if (App.Prefs.get("entry-timestamps") == "absolute") {
			toMacroize += sch.getAbsoluteTime(this.entry.publish_date);
		} else {
			toMacroize += sch.getRelativeTime(this.entry.publish_date);
		}
		if (this.entry._orig.source) {
			toMacroize += " from <span class = 'link'>{$_orig.source}</span>";
		}
		toMacroize += "</span>";

		if(this.entry.is_private_message === true){
			this.setClassName("is_private_message");
		} else if(this.entry.is_mention === true){
			this.setClassName("is_mention");
		} else if(this.entry.is_author === true){
			this.setClassName("is_author");
		} else {
			this.setClassName("is_normal")
		}

		this.$.text.applyStyle("font-size", App.Prefs.get("entry-text-size"));

		this.$.text.setContent(enyo.macroize(toMacroize, this.entry));
	},
	entryClick: function(inSender, inEvent, inRowIndex) {
		var className = inEvent.target.className;
		if(_.includes(className, "username")){
			var username = inEvent.target.getAttribute('data-user-screen_name') || inEvent.target.innerText.replace("@", "");
			AppUI.viewUser(username, this.entry.service, this.entry.account_id, parseInt(this.owner.name.replace('Column', ''), 10));
		} else if(className === "avatar"){
			AppUI.viewUser(this.entry.author_username, this.entry.service, this.entry.account_id, parseInt(this.owner.name.replace('Column', ''), 10));
		} else if(className === "small-avatar"){
			AppUI.viewUser(this.entry.reposter_username, this.entry.service, this.entry.account_id, parseInt(this.owner.name.replace('Column', ''), 10));
		} else if(_.includes(className, "hashtag")){
			AppUI.search(inEvent.target.innerText, this.entry.account_id);
		} else if(!inEvent.target.getAttribute("href")){ //if not a link, send out a general tap event
			this.doEntryClick(inEvent, inRowIndex);
		}
	},
	entryHold: function(inSender, inEvent, inRowIndex) {
		this.doEntryHold(inEvent, inEvent.rowIndex);
	}
});
