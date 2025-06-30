export interface News {
	_id: string;
	title: string;
	content: string;
}

export const CurrentNews: News[] = [
	{
		_id: '6',
		title: '🐙 Jetzt auch auf GitHub!',
		content: 'Lust direkt an der Entwicklung teilzunehmen? Dann melde dich gerne bei uns auf GitHub!'
	},
	{
		_id: '5',
		title: '🪲 Bugbash Q2/25',
		content: 'Dank eurer Rückmeldung konnten wir viele Bugs beheben.'
	},
	{
		_id: '4',
		title: '🏆Eigener Menüpunkt für Zertifikate',
		content: 'Zertifikate können jetzt unabhängig von den Erfahrungen verwaltet werden.'
	},
	{
		_id: '3',
		title: '💾 API Zugriffe möglich!',
		content: 'Es kann über PowerBI mit entsprechender Genehmigung auf die API zugegriffen werden. Dies wird die Datenaufbereitung erheblich vereinfachen.'
	},
];
