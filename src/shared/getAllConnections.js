export default function getAllConnections(itemId, connections) {
  return [
    //innerConnections
    connections.filter(
      (connection) => connection.parent.item === itemId && !connection.temp
    ),
    //outerConnections
    connections.filter(
      (connection) => connection.item === itemId && !connection.temp
    ),
  ];
}
