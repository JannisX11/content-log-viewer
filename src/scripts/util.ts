export function uuid(): string {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}



export function convertTouchEvent(event) {
	if (event && event.changedTouches && event.changedTouches.length && event.offsetX == undefined) {
		event.preventDefault();
		event.clientX = event.changedTouches[0].clientX;
		event.clientY = event.changedTouches[0].clientY;
		event.offsetX = event.changedTouches[0].clientX;
		event.offsetY = event.changedTouches[0].clientY;

		let offset = calculateOffset(event.target);
		if (offset) {
			event.offsetX -= offset[0];
			event.offsetY -= offset[1];
		}
	}
	return event;
}

function calculateOffset(element) {
	var rect = element.getBoundingClientRect();
	return [
		rect.left + window.scrollX,
		rect.top + window.scrollY,
	]
}
function isFirefox(): boolean {
	return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}
export function createDatalist(id: string, list: {key: string, label: string}[]) {
	let datalist = document.createElement('datalist');
	datalist.id = id;
	list.forEach(item => {
		let opt = document.createElement('option');
		opt.value = item.key;
		opt.text = item.label
		datalist.append(opt);
	})
	document.body.append(datalist);
}

interface ImportOptions {
	extensions?: string[]
	multiple?: boolean
	readtype?: 'image' | 'buffer'
}

interface ExportOptions {
	name: string
	content: string
	extensions?: string[]
	custom_writer?: (content: any, name: string) => void
	savetype?: 'image'|'text'
}

export const IO = {
	import(options: ImportOptions, cb: (ImportResult) => void): void {
		if (typeof options !== 'object') {options = {}}
		let input = document.createElement('input');
		input.type = 'file';
		input.accept = options.extensions ? '.' + options.extensions.join(',.') : '';
		input.multiple = options.multiple === true;
		input.onchange = function(e) {
			if (!input.files) return;
			let results: {[key: string]: any} = [];
			let result_count = 0;
			let i = 0;
			while (i < input.files.length) {
				(function() {
					let file = input.files[i]
					let reader = new FileReader()
					let i2 = i+0;
					reader.onloadend = function() {
						if (!reader.result || !input.files) return;
						let result = reader.result
						results[i2] = {
							name: file.name,
							path: file.name,
							content: result
						}
						result_count++;
						if (result_count === input.files.length) {
							cb(results)
						}
					}
					if (options.readtype === 'image') {
						reader.readAsDataURL(file)
					} else if (options.readtype === 'buffer') {
						reader.readAsArrayBuffer(file)
					} else /*text*/ {
						reader.readAsText(file)
					}
					i++;
				})()
			}
		}
		input.click();
	},
	export(options: ExportOptions, cb?: () => void): void {
		if (!options) return;

		let file_name = options.name + (options.extensions ? '.'+options.extensions[0] : '')
		let callback_used;

		if (options.custom_writer) {
			options.custom_writer(options.content, file_name)
			
		} else if (options.savetype === 'image') {

			let element = document.createElement('a');
			element.href = options.content || '';
			element.download = file_name;
			element.style.display = 'none';
			if (isFirefox()) document.body.appendChild(element);
			element.click();
			if (isFirefox()) document.body.removeChild(element);

		} else {
			//let blob = new Blob([options.content], {type: "text/plain;charset=utf-8"});

			let element = document.createElement('a');
			element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(options.content);
			element.download = file_name
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);


			//saveAs(blob, file_name, {autoBOM: true})
		}
		if (!callback_used && typeof cb === 'function') {
			cb()
		}
	}
}
