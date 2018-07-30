// From http://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
export function wrapText(context, text, x, y, line_width, line_height)
{
    var line = '';
    var paragraphs = text.split('\n');
    for (var i = 0; i < paragraphs.length; i++)
    {
        var words = paragraphs[i].split(' ');
        for (var n = 0; n < words.length; n++)
        {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > line_width && n > 0)
            {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += line_height;
            }
            else
            {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
        y += line_height;
        line = '';
    }
}

// http://stackoverflow.com/questions/9792927/javascript-array-search-and-remove-string
export function arrayRemove (array,elem, all) {
  for (var i=array.length-1; i>=0; i--) {
    if (array[i] === elem) {
        array.splice(i, 1);
        if(!all)
          break;
    }
  }
  return array;
}

export default function sleep(seconds) {
	return new Promise((resolve, fail) => {
		setTimeout(() => {
			resolve()
		}, seconds)
	})
}
