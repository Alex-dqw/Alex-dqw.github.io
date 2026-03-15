 document.addEventListener('DOMContentLoaded', function() {
            // Находим элементы
            const playBtn = document.querySelector('.play-btn');
            const playNewTabBtn = document.querySelector('.play2-btn');
            const downloadBtn = document.querySelector('.download-btn');

            // Назначаем обработчики (вместо onclick)
            if (playBtn) playBtn.addEventListener('click', () => handlePlay(false));
            if (playNewTabBtn) playNewTabBtn.addEventListener('click', () => handlePlay(true));
            if (downloadBtn) downloadBtn.addEventListener('click', handleDownload);
        });


function handlePlay(newLink = false) {
            let link = document.getElementById('linkInput').value;
            if (link) {
                link = link.replace("/w/", "/api/v1/videos/");
                
                fetch(link)
                    .then(response => response.json())
                    .then(data => {
                        const firstPlaylist = data.streamingPlaylists.find(p => p.files && p.files.length > 0);
                        
                        if (firstPlaylist) {
                            const firstFile = firstPlaylist.files[0];
                            
                            if (firstFile && firstFile.magnetUri) {
                                // Разбиваем строку по "&ws=" и берем вторую часть
                                let parts = firstFile.magnetUri.split("&ws=");
                                if (parts.length > 1) {
                                    // Декодируем строку: %2F станет /, %3A станет :
                                    let directUrl = decodeURIComponent(parts[1]);
                                    // Если расширение:
                                    if (typeof chrome !== "undefined" && chrome.tabs) {
                                        if (newLink) {
                                            // Открываем в новой вкладке
                                            chrome.tabs.create({ url: directUrl });
                                        } else {
                                            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                                                if (tabs[0]) {
                                                    chrome.tabs.update(tabs[0].id, { url: directUrl });
                                                }
                                            });
                                        }
                                    } else {
                                        if (newLink) {
                                            // Открываем в новой вкладке
                                            window.open(directUrl, '_blank');
                                        } else {
                                            window.location.href = directUrl;
                                        }
                                    }
                                }
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                    });
            }
        }

        function handleDownload() {

            let link = document.getElementById('linkInput').value;

            if (link.includes("bastyon.com")) {
            
            //let bastyonLink = "https://bastyon.com/index?video=1&v=83288116447662c81fdc47ab32c64303bb263f85a8b9221d97420a4109a82862";
            let urlParams = new URLSearchParams(new URL(link).search);
            let videoHash = urlParams.get('v');

            if (videoHash) {
                //let apiUrl = `https://api.pocketnet.app/rpc/getposts?ids=${videoHash}`;
                //let apiUrl = `https://corsproxy.io/?https://api.pocketnet.app/rpc/getposts?ids=${videoHash}`;
                
                //let targetUrl = encodeURIComponent(`https://api.pocketnet.app/rpc/getposts?ids=${videoHash}`);
                //let apiUrl = `https://api.allorigins.win/get?url=${targetUrl}`;
                
                //let apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent('https://api.pocketnet.app/rpc/getposts?ids=' + videoHash)}`;

                let targetUrl = `https://api.pocketnet.app/rpc/getposts?ids=${videoHash}`;
                let apiUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

                fetch(apiUrl)
                    .then(res => {
                        if (res.ok) return res.json();
                        throw new Error('CORS or Network error');
                    })
                    .then(response => {
                        // Проверяем, что пост найден и в нем есть видео
                        if (response.result && response.result.length > 0) {
                            let postData = response.result[0];
                            let videoInfo = postData.v; // Объект с данными видео

                            if (videoInfo && videoInfo.host && videoInfo.id) {
                                // Собираем ту самую ссылку
                                let peertubeLink = `https://${videoInfo.host}/w/${videoInfo.id}`;
                                document.getElementById('linkInput').value = peertubeLink;
                                startVideoDownload(peertubeLink);
                            }
                        }
                });
            }
            
            }
            else if (link.includes("peertube")) {
                startVideoDownload(link);
            }
        }

        // Выносим общую логику скачивания в отдельную функцию, чтобы не дублировать код
        function startVideoDownload(peertubeLink) {
            let apiUrl = peertubeLink.replace("/w/", "/api/v1/videos/");      
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    const firstPlaylist = data.streamingPlaylists.find(p => p.files && p.files.length > 0);
                    if (firstPlaylist) {
                        const firstFile = firstPlaylist.files[0];
                        if (firstFile && firstFile.magnetUri) {
                            let parts = firstFile.magnetUri.split("&ws=");
                            if (parts.length > 1) {
                                let directUrl = decodeURIComponent(parts[1]);
                                
                                // Логика Blob для принудительного скачивания
                                fetch(directUrl)
                                    .then(res => res.blob())
                                    .then(blob => {
                                        const blobUrl = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = blobUrl;
                                        a.download = directUrl.split('/').pop() || 'video.mp4';
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(blobUrl);
                                        document.body.removeChild(a);
                                    })
                                    .catch(err => {
                                        console.warn("CORS block on file, opening in new tab");
                                        window.open(directUrl, '_blank');
                                    });
                            }
                        }
                    }
                });
        }