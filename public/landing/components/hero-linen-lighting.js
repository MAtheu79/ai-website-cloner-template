/** Convert a viewport rectangle to the linen canvas's bottom-up pixel space. */
export function nodeLightRectangle(node, canvas) {
  return [
    node.left + node.width / 2 - canvas.left,
    canvas.bottom - (node.top + node.height / 2),
    node.width / 2,
    node.height / 2,
  ];
}

