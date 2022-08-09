import { Translations } from ".";

export const pt_BR_Translations: Translations = Object.freeze({
	translations: {
		dialogs: {
			mediaOptions: {
				description:
					"Faça alterações aos metadados da sua media aqui. Clique em \"Salvar\" quando terminar.",
				title: "Edite/Veja informações da media",
			},
			deleteMedia: {
				subtitle:
					"Tem certeza de que quer deletar esta media do seu computador?",
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
			pasteVideoURL: "Cole uma url do YouTube aqui",
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
				"Deve haver \"Artista\" nos metadados da media!",
			mediaMetadataSaved: "Novos metadados salvos.",
			convertAlreadyExists: "Já há uma conversão de ",
			downloadAlreadyExists: "Já há uma transferência de ",
			conversionCanceled: "Conversão cancelada para ",
			conversionSuccess: "Conversão bem sucedida para ",
			downloadCanceled: "Transferência cancelada para ",
			conversionFailed: "Conversão falhou para ",
			downloadSuccess: "Transferência bem sucedida para ",
			noLyricsFound: "Não foram encontradas letras para ",
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
			selectAllMedias: "Selecionar todas as medias",
			searchForLyrics: "Buscar letras",
			shareMedia: "Compartilhar media",
			deleteMedia: "Deletar media",
		},

		infos: {
			noDownloadsInProgress: "Não há transferências em progresso",
			noConversionsInProgress: "Não há conversões em progresso",
			converted: "Convertido",
		},

		decorations: {
			selected: "selecionadas",
			medias: "medias",
			size: "Tamanho",
		},

		pages: {
			Home: "Página Inicial",
			Favorites: "Favoritos",
			Download: "Transferir",
			History: "Histórico",
			Convert: "Converter",
		},

		titles: {
			convert: "Converter medias para 'mp3'",
			history: "Histórico dos áudio tocados",
			download: "Baixar media como áudio",
			favorites: "Meus audios favoritos",
			home: "Lista de todos os audios",
		},
	},
});
