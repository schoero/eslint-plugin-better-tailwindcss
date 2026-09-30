export type VisitedNodes<T> = Set<T>;

export function createVisitedNodes<T>(visited?: VisitedNodes<T>): VisitedNodes<T> {
  return new Set(visited ?? []);
}

export function visitNode<T>(visited: VisitedNodes<T>, node: T): boolean {
  if(visited.has(node)){
    return false;
  }

  visited.add(node);
  return true;
}
