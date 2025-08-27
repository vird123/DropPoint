// Instance ID from Main Process
const instanceId = parseInt(window.location.search.slice(4));
console.log("Instance ID client: " + instanceId);

// 文件扩展名到文件类型的映射表
const FILE_TYPE_MAP = {
  // 文本文件
  text: new Set([
    'md', 'markdown', 'txt', 'rtf', 'doc', 'docx', 'odt', 'ott', 'odm', 'pdf', 'xls', 'xlsx', 'ods', 'ots', 'ppt', 'pptx', 'odp', 'otp',
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt',
    'html', 'css', 'scss', 'less', 'json', 'xml', 'yaml', 'yml', 'toml'
  ]),
  
  // 数据库文件
  file: new Set([
    'db', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'odb', 'frm', 'myd', 'myi', 'ibd'
  ]),
  
  // 图片文件
  image: new Set([
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'tif'
  ]),
  
  // 视频文件
  video: new Set([
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv',
    'mpg', 'mpeg', 'm4v', '3gp', 'rm', 'rmvb', 'mts', 'vob'
  ]),
  
  // 音频文件
  audio: new Set([
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'
  ])
};

/**
 * Determines file type based on file properties and extension
 * @param {File} file - The file object from drag and drop
 * @returns {string} - The file type for icon mapping
 */
function getFileType(file) {
  // Check if it's a directory/folder
  if (file.type === "" && file.size === 0 && file.name.indexOf('.') === -1) {
    return "folder";
  }
  
  // Get file extension
  const fileName = file.name.toLowerCase();
  const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
  
  // 使用映射表查找文件类型
  for (const [fileType, extensions] of Object.entries(FILE_TYPE_MAP)) {
    if (extensions.has(extension)) {
      return fileType;
    }
  }
  
  // Fallback to MIME type detection
  if (file.type) {
    const mimeType = file.type.split('/')[0];
    if (mimeType && mimeType !== 'application') {
      return mimeType;
    }
  }
  
  // Files without extension or unknown types
  return "file"; // Default to generic file icon
}

// File List which will contain list of dicts in the format
// {filePath:"file/Path", fileType:"filetype"}
let filelist = [];

// Custom event to trigger on push.
// Will be used for creating UI elements.
const filePushEvent = new Event("file-push");
Object.defineProperty(filelist, "push", {
  value: function () {
    for (var i = 0, n = this.length, l = arguments.length; i < l; i++, n++) {
      // Adding pushed element one by one into the array
      this[n] = arguments[i];
    }
    // Trigger the event
    document.dispatchEvent(filePushEvent);
    return n;
  },
});

// Testing by growing the file list
// let growfilelist = () => {
//   for (let i = 0; i < 8; i++) {
//     filelist.push({
//       fileName: "TestFile",
//       fileType: filetypes[Math.floor(Math.random() * filetypes.length)],
//     });
//   }
//   console.log(filelist);
// };

// FileQueue to implement file icons animation
class FileQueueUI {
  constructor() {
    this.queue = [];
  }
  enqueue(ele) {
    if (this.queue.length > 2) {
      this.dequeue();
    }
    this.queue.push(ele);
  }
  dequeue() {
    if (this.isEmpty()) return null;
    return this.queue.shift();
  }
  front() {
    if (this.isEmpty()) return null;
    return this.queue[0];
  }
  isEmpty() {
    return this.queue.length === 0;
  }
  printQueue() {
    var str = "";
    for (var i = 0; i < this.queue.length; i++) {
      str += this.queue[i] + " ";
    }
    return str;
  }
  length() {
    return this.queue.length;
  }
}

// UI image elements
const imageHolder = document.querySelectorAll(".file-icon img");

let fq = new FileQueueUI();

document.addEventListener("file-push", () => {
  fq.enqueue(filelist[filelist.length - 1].fileType);
  for (let i = 0; i < fq.length(); i++) {
    let imageSource = "./media/" + fq.queue[fq.length() - 1 - i] + ".png";
    imageHolder[i].src = imageSource;
  }

  // Reflow animation when new files are added
  imageHolder.forEach((e) => (e.style.animation = "none"));
  setTimeout(() => {
    imageHolder.forEach((e) => (e.style.animation = ""));
  }, 100);

  document.getElementsByTagName("num")[0].innerHTML = filelist.length;
});

// Holder area where files will be dragged and dropped
const holder = document.getElementById("droppoint");

// Adding "dragged" class to the holder when the file is dragged over it
// "Dragged" class is used to do the border animation
holder.ondragover = (e) => {
  e.preventDefault;
  e.stopPropagation;
  holder.setAttribute("class", "dragged");
  return false;
};
holder.ondragenter = (e) => {
  e.preventDefault;
  e.stopPropagation;
  holder.setAttribute("class", "dragged");
  return false;
};
// Removing the "dragged" class from the holder
// when the file is dragged out of it
holder.ondragleave = (e) => {
  e.preventDefault;
  e.stopPropagation;
  holder.removeAttribute("class");
  return false;
};
holder.ondragend = (e) => {
  e.preventDefault;
  e.stopPropagation;
  holder.removeAttribute("class");
  return false;
};

const uploadArea = document.querySelector(".upload");
const dragOutArea = document.querySelector("#drag");
holder.ondrop = (e) => {
  e.preventDefault();
  // Remove animation borders on file drop inside DropPoint
  holder.removeAttribute("class");

  // Get the files from the event
  for (let f of e.dataTransfer.files) {
    // Check if the file is already in the filelist

    let duplicateFile = false;

    for (let i = 0; i < filelist.length; i++) {
      if (filelist[i].filepath.includes(f.name)) {
        duplicateFile = true;
        break;
      }
    }

    if (duplicateFile) {
      alert("File already in the instance");
      continue;
    }
    // Add the file to the filelist
    filelist.push({
      filepath: f.path.toString(),
      fileType: getFileType(f),
    });
  }

  uploadArea.style.display = "none";
  dragOutArea.style.display = "flex";
};

const fileicons = document.querySelector(".file-icon");
const clearDrag = () => {
  filelist = [];
  if (dragicons[2]) {
    fileicons.removeChild(dragicons[2]);
  }
  if (dragicons[1]) {
    fileicons.removeChild(dragicons[1]);
  }
};

// Drag out request to electron
document.getElementById("drag").ondragstart = (event) => {
  event.preventDefault();
  const params = {
    filelist: filelist,
    instanceId: instanceId,
  };
  window.electron.dragOutListener(params);
  uploadArea.style.display = "flex";
  dragOutArea.style.display = "none";
  clearDrag();
};

// Close / Clear Button
document.querySelector(".close").addEventListener("click", () => {
  window.close();
});

// 主题管理
const applyTheme = (theme) => {
  const body = document.body;
  if (theme === 'dark') {
    body.classList.add('dark');
  } else {
    body.classList.remove('dark');
  }
};

// 初始化主题
const initializeTheme = () => {
  electron.getCurrentTheme((theme) => {
    applyTheme(theme);
  });
};

// 监听主题变化
electron.onThemeChanged((theme) => {
  applyTheme(theme);
});

// 监听主题设置变化
electron.onThemeSettingChanged((themeSetting) => {
  // 当用户在设置中更改主题时，重新获取当前主题
  setTimeout(() => {
    electron.getCurrentTheme((theme) => {
      applyTheme(theme);
    });
  }, 100);
});

// 页面加载完成后初始化主题
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
  initializeTheme();
}
