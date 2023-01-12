import { Translations } from "./TranslationType";

export const pt_BR_Translations: Translations = {
	dialogs: {
		mediaOptions: {
			description:
				'Faça alterações aos metadados da sua media aqui. Clique em "Salvar" quando terminar.',
			title: "Edite/Veja informações da media",
		},
		deleteMedia: {
			subtitle: "Tem certeza de que quer deletar esta media do seu computador?",
		},
		sharingMedia: "Compartilhando media",
	},

	tooltips: {
		closeShareScreen: "Fechar modal de compartilhamento",
		showAllDownloadingMedias: "Medias sendo baixadas",
		cancelDownload: "Cancelar/Remover transferência",
		cancelConversion: "Cancelar/Remover conversão",
		showAllConvertingMedias: "Medias convertendo",
		reloadAllMedias: "Recarregar todas as medias",
		openMediaOptions: "Metadados desta media",
		playPreviousTrack: "Tocar media anterior",
		toggleMinimizeWindow: "Minimizar janela",
		toggleMaximizeWindow: "Maximizar janela",
		toggleOpenLyrics: "Abrir/Fechar letras",
		toggleLoopThisMedia: "Repetir media",
		playNextTrack: "Tocar próxima media",
		playThisMedia: "Tocar esta media",
		closeDialog: "Fechar diálogo",
		closeWindow: "Fechar janela",
		toggleTheme: "Alternar tema",
		toggleFavorite: "Favoritar",
		toggleRandom: "Randomizar",
		cleanList: "Limpar lista",
		playPause: "Tocar/Pausar",
		sortBy: "Ordernar por",
		goto: "Ir para ",
	},

	buttons: {
		resetAllAppData: "Resetar todos os dados do aplicativo",
		convert: "Selecione media(s) para converter",
		cleanFinished: "Limpar concluídos",
		reloadWindow: "Recarregar janela",
		selectImg: "Selecionar imagem",
		deleteMedia: "Deletar media",
		saveChanges: "Salvar",
		confirm: "Confirmar",
		download: "Baixar",
		cancel: "Cancelar",
	},

	labels: {
		pasteVideoURL: "Cole uma URL do YouTube aqui",
		searchForSongs: "Pesquisar por músicas",
		duration: "Duração",
		genres: "Gênero",
		artist: "Artista",
		lyrics: "Letras",
		image: "Imagem",
		title: "Título",
		size: "Tamanho",
		album: "Album",
	},

	toasts: {
		mediaMetadataNotSaved:
			"Error ao salvar novos metadados. Veja o console pressionando Ctrl+Shift+i.",
		assureMediaHasArtistMetadata:
			'Deve haver "Artista" nos metadados da media!',
		downloadAlreadyExists: "Já há uma transferência de ",
		downloadSuccess: "Transferência bem sucedida para ",
		noLyricsFound: "Não foram encontradas letras para ",
		downloadCanceled: "Transferência cancelada para ",
		conversionSuccess: "Conversão bem sucedida para ",
		convertAlreadyExists: "Já há uma conversão de ",
		conversionCanceled: "Conversão cancelada para ",
		mediaMetadataSaved: "Novos metadados salvos.",
		conversionFailed: "Conversão falhou para ",
		mediaDeletionSuccess: "Media deletada: ",
		mediaDeletionError: {
			beforePath: "Erro ao deletar ",
			afterPath: "\nVeja o console pressionando Ctrl+Shift+i!",
		},
		conversionError: {
			beforePath: "Erro na conversão de ",
			afterPath: "! Por favor, tente novamente mais tarde.",
		},
		downloadError: { beforePath: "Transferência de ", afterPath: " falhou!" },
	},

	errors: {
		mediaListKind: {
			errorFallbackDescription:
				"Erro ao renderizar lista. Isso é um bug. Tente fechar e abrir o aplicativo, se o erro persistir, click no botão abaixo.",
			errorTitle: "Algo deu errado",
		},
		gettingMediaInfo: "Erro ao buscar media!",
		noVideoIdFound: "ID não encontrado!",
	},

	alts: {
		museLogo:
			"Logo da Muse, um círculo semelhante a um donut com tons de azul.",
		noMediasFound: "Medias não encontradas",
		videoThumbnail: "Miniatura do video",
	},

	sortTypes: { name: "Nome", date: "Data" },

	ctxMenus: {
		toggleDevTools: "Ferramentas do Desenvolvedor",
		selectAllMedias: "Selecionar tudo",
		searchForLyrics: "Buscar letras",
		shareMedia: "Compartilhar",
		deleteMedia: "Deletar",
	},

	infos: {
		noDownloadsInProgress: "Não há transferências em progresso",
		noConversionsInProgress: "Não há conversões em progresso",
		converted: "Convertido",
	},

	decorations: {
		selected: "selecionadas",
		size: "Tamanho",
		media: "media",
	},

	pages: {
		Home: "Página Inicial",
		Favorites: "Favoritos",
		Download: "Transferir",
		History: "Histórico",
		Convert: "Converter",
	},

	titles: {
		history: "Histórico dos áudio tocados",
		convert: "Converter medias para 'mp3'",
		download: "Baixar media como áudio",
		favorites: "Meus audios favoritos",
		home: "Lista de todos os audios",
	},
};
