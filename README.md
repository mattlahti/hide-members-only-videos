## Hide Members Only Videos ![icon-32.png](assets/icon-32.png)

This is a Mozilla extension to hide all members only video recommendations on YouTube. No build needed, just install the extension.

https://addons.mozilla.org/en-US/firefox/addon/hide-yt-members-only-videos

Before & after:

<img width="323" height="121" alt="before_hiding_members_only_video" src="https://github.com/user-attachments/assets/b39090c2-ebb5-42e4-b972-1f83cfd07a6a" />
<img width="319" height="130" alt="after_hiding_members_only_video" src="https://github.com/user-attachments/assets/bd247ed4-2471-4ebc-b501-14ceffb77e65" />

### Features

- Toggle specific locations on the site where members only videos are hidden
   - Homepage
   - Recommended videos (on the right side of the player)
   - Channel pages
   - Playlists
- Statistics broken down by channel of the video and what location it was hidden in
- Ability to exclude specific channels from hiding
- Settings to customize the extension (see below)

### Statistics

Clicking the extension icon will open a popup showing the number of hidden videos broken down by the channel.

<img width="362" height="440" alt="extension_statistics" src="https://github.com/user-attachments/assets/58cbad38-1e47-4dd3-96b9-9554822f23e4" />

### Settings

This extension has settings where the following can be customized:
- Channels that should be excluded from hiding
- Locations on the site where videos are hidden
- Whether statistics should be tracked and shown
- Enabling debug logs

<img width="358" height="538" alt="extension_settings" src="https://github.com/user-attachments/assets/a7120b57-b16c-481c-aae0-1ac777d6c44c" />

### Issues

Please report any issues you find on the [GitHub issues page](https://github.com/mattlahti/hide-members-only-videos/issues).

### Development

Contributions are welcome!
If you make changes to any of the source files, you will need to rebuild them to update the content script.

`npm run build` or `npm run watch`
