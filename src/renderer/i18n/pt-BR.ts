import { Translations } from "./TranslationType";

export const pt_BR_Translations: Translations = {
	dialogs: {
		mediaOptions: {
			description:
				'Faça alterações aos metadados da sua mídia aqui. Clique em "Salvar" quando terminar.',
			title: "Edite/Veja informações da mídia",
		},
		deleteMedia: {
			subtitle: "Tem certeza de que quer deletar esta mídia do seu computador?",
		},
		sharingMedia: "Compartilhando mídia",
	},

	tooltips: {
		closeShareScreen: "Fechar modal de compartilhamento",
		showAllDownloadingMedias: "Mídias sendo baixadas",
		cancelDownload: "Cancelar/Remover transferência",
		cancelConversion: "Cancelar/Remover conversão",
		showAllConvertingMedias: "Mídias convertendo",
		reloadAllMedias: "Recarregar todas as mídias",
		openMediaOptions: "Metadados desta mídia",
		playPreviousTrack: "Tocar mídia anterior",
		toggleMinimizeWindow: "Minimizar janela",
		toggleMaximizeWindow: "Maximizar janela",
		toggleOpenLyrics: "Abrir/Fechar letras",
		toggleLoopThisMedia: "Repetir mídia",
		playNextTrack: "Tocar próxima mídia",
		playThisMedia: "Tocar esta mídia",
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
		convert: "Selecione mídia(s) para converter",
		cleanFinished: "Limpar concluídos",
		reloadWindow: "Recarregar janela",
		selectImg: "Selecionar imagem",
		deleteMedia: "Deletar mídia",
		saveChanges: "Salvar",
		confirm: "Confirmar",
		cancel: "Cancelar",
		download: "Baixar",
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
		album: "Álbum",
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
		mediaDeletionSuccess: "Mídia deletada: ",
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
				"Erro ao renderizar lista. Isso é um bug! Tente fechar e abrir o aplicativo, se o erro persistir, click no botão abaixo.",
			errorTitle: "Algo deu errado",
		},
		gettingMediaInfo: "Erro ao buscar mídia!",
		noVideoIdFound: "ID não encontrado!",
	},

	alts: {
		museLogo:
			"Logo da Muse, um círculo semelhante a um donut com tons de azul.",
		noMediasFound: "Mídias não encontradas",
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
		selected: "selecionada(s)",
		size: "Tamanho",
		media: "mídia",
	},

	pages: {
		Home: "Página Inicial",
		Favorites: "Favoritos",
		Download: "Transferir",
		History: "Histórico",
		Convert: "Converter",
	},

	titles: {
		history: "Histórico das mídias tocadas",
		convert: "Converter mídias para 'mp3'",
		download: "Baixar mídia como áudio",
		home: "Lista de todas as mídiaa",
		favorites: "Minhas favoritas",
	},
};
