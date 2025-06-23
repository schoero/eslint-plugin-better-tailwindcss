import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";

import type {
  ConflictingClasses,
  GetConflictingClassesRequest,
  GetConflictingClassesResponse
} from "./conflicting-classes.js";


runAsWorker(async ({ classes, configPath }: GetConflictingClassesRequest): Promise<GetConflictingClassesResponse> => {
  const context = await createTailwindContext(configPath);

  const conflicts: ConflictingClasses = {};

  const classRules = classes.reduce<Record<string, RuleContext>>((classRules, className) => ({
    ...classRules,
    [className]: context.parseCandidate(className).reduce((classRules, candidate) => {
      const [rule] = context.compileAstNodes(candidate);
      return {
        ...classRules,
        ...getRuleContext(rule?.node?.nodes)
      };
    }, {})
  }), {});

  for(const className in classRules){
    otherClassLoop: for(const otherClassName in classRules){
      if(className === otherClassName){
        continue otherClassLoop;
      }

      const classRule = classRules[className];
      const otherClassRule = classRules[otherClassName];

      const paths = Object.keys(classRule);
      const otherPaths = Object.keys(otherClassRule);

      if(paths.length !== otherPaths.length){
        continue otherClassLoop;
      }

      for(const path of paths){
        for(const otherPath of otherPaths){
          if(path !== otherPath){
            continue otherClassLoop;
          }

          if(classRule[path].length !== otherClassRule[otherPath].length){
            continue otherClassLoop;
          }

          for(const classRuleProperty of classRule[path]){
            if(!otherClassRule[otherPath].find(otherProp => {
              return otherProp.cssPropertyName === classRuleProperty.cssPropertyName;
            })){
              continue otherClassLoop;
            }
          }

          for(const otherClassRuleProperty of otherClassRule[otherPath]){
            conflicts[className] ??= {};
            conflicts[className][otherClassName] ??= [];
            conflicts[className][otherClassName].push(otherClassRuleProperty);
          }
        }
      }

    }
  }

  return conflicts;
});

export type StyleRule = {
  kind: "rule";
  nodes: AstNode[];
  selector: string;
};

export type AtRule = {
  kind: "at-rule";
  name: string;
  nodes: AstNode[];
  params: string;
};

export type Declaration = {
  important: boolean;
  kind: "declaration";
  property: string;
  value: string | undefined;
};

export type Comment = {
  kind: "comment";
  value: string;
};

export type Context = {
  context: Record<string, boolean | string>;
  kind: "context";
  nodes: AstNode[];
};

export type AtRoot = {
  kind: "at-root";
  nodes: AstNode[];
};

export type Rule = AtRule | StyleRule;
export type AstNode = AtRoot | AtRule | Comment | Context | Declaration | StyleRule;


interface Property {
  cssPropertyName: string;
  important: boolean;
  cssPropertyValue?: string;
}

interface RuleContext {
  [hierarchy: string]: Property[];
}

function getRuleContext(nodes: AstNode[]): RuleContext {
  const context: RuleContext = {};

  if(!nodes){
    return context;
  }

  const checkNested = (nodes: AstNode[], context: RuleContext, path: string = "") => {
    for(const node of nodes.filter(node => !!node)){
      if(node.kind === "declaration"){
        context[path] ??= [];

        if(node.value === undefined){
          continue;
        }

        context[path].push({
          cssPropertyName: node.property,
          cssPropertyValue: node.value,
          important: node.important
        });
        continue;
      }

      if(node.kind === "rule"){
        return void checkNested(node.nodes, context, path + node.selector);
      }

      if(node.kind === "at-rule"){
        return void checkNested(node.nodes, context, path + node.name + node.params);
      }
    }
  };

  checkNested(nodes, context);

  return context;
}
