// Strips tags from the caption.text part of an update
function strip_tags(item) {
  if(item.caption && item.caption.text) {
    var stripped = item.caption.text.replace(/\s?#[A-Za-z1-9]+/g, '');
    item.caption.text = stripped;
    return item;
  }
}

module.exports.strip_tags = strip_tags;
