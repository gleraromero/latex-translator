export interface LatexElement {
  content: string;
  startIndex: number;
  endIndex: number;
  type: 'command' | 'math' | 'math-display' | 'equation';
  commandStructure?: string;
  commandName?: string;
}

export interface CommandStructure {
  commandName: string;
  structure: string;
  content: string;
  fullCommand: string;
}

export function extractCommandStructure(command: string): CommandStructure | null {
  // Simple regex to extract command name
  const commandNameMatch = command.match(/^\\([a-zA-Z0-9]+)/);
  if (!commandNameMatch) return null;
  
  const commandName = commandNameMatch[1];
  
  // Parse parameters manually
  let pos = commandName.length + 1; // Skip \command
  let optionalParams = '';
  let requiredParams = '';
  let content = '';
  
  // Skip whitespace
  while (pos < command.length && /\s/.test(command[pos])) {
    pos++;
  }
  
  // Parse optional parameters first
  while (pos < command.length && command[pos] === '[') {
    let bracketCount = 0;
    const startPos = pos;
    
    do {
      if (command[pos] === '[') bracketCount++;
      if (command[pos] === ']') bracketCount--;
      pos++;
    } while (pos < command.length && bracketCount > 0);
    
    optionalParams += command.substring(startPos, pos);
  }
  
  // Skip whitespace
  while (pos < command.length && /\s/.test(command[pos])) {
    pos++;
  }
  
  // Parse required parameters
  while (pos < command.length && command[pos] === '{') {
    let braceCount = 0;
    const startPos = pos;
    
    do {
      if (command[pos] === '{') braceCount++;
      if (command[pos] === '}') braceCount--;
      pos++;
    } while (pos < command.length && braceCount > 0);
    
    requiredParams += command.substring(startPos, pos);
  }
  
  // Extract content from the last required parameter
  if (requiredParams) {
    const lastBraceMatch = requiredParams.match(/\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}$/);
    if (lastBraceMatch) {
      content = lastBraceMatch[1];
    }
  } else if (optionalParams) {
    // If no required params, get content from the last optional parameter
    const lastBracketMatch = optionalParams.match(/\[([^\]]*)\]$/);
    if (lastBracketMatch) {
      content = lastBracketMatch[1];
    }
  }
  
  // Reconstruct the structure
  let structure = `\\${commandName}`;
  
  // Add optional parameters to structure
  const optionalMatches = optionalParams.match(/\[[^\]]*\]/g);
  if (optionalMatches) {
    optionalMatches.forEach(() => {
      structure += '[]';
    });
  }
  
  // Add required parameters to structure
  const requiredMatches = requiredParams.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
  if (requiredMatches) {
    requiredMatches.forEach(() => {
      structure += '{}';
    });
  }
  
  return {
    commandName,
    structure,
    content,
    fullCommand: command
  };
}

export function parseLatexContent(text: string): LatexElement[] {
  const elements: LatexElement[] = [];
  
  // Process patterns in order of specificity (most specific first)
  const patterns = [
    // Math display mode: $$...$$ or \[...\] (most specific)
    { 
      regex: /(\$\$.*?\$\$|\\\[.*?\\\])/gs, 
      type: 'math-display' as const 
    },
    // Math inline: $...$ or \(...\) (more specific than commands)
    { 
      regex: /(\$[^$\n]*?\$|\\\(.*?\\\))/gs, 
      type: 'math' as const 
    }
  ];

  // Process math patterns first
  patterns.forEach(({ regex, type }) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const element: LatexElement = {
        content: match[1],
        startIndex: match.index,
        endIndex: match.index + match[1].length,
        type
      };
      elements.push(element);
    }
  });

  // Find equation environments manually
  const equationRegex = /\\begin\{equation\}/g;
  let equationMatch;
  while ((equationMatch = equationRegex.exec(text)) !== null) {
    const startIndex = equationMatch.index;
    const beginTag = '\\begin{equation}';
    
    // Find the corresponding \end{equation}
    let pos = startIndex + beginTag.length;
    let braceCount = 0;
    let foundEnd = false;
    
    while (pos < text.length) {
      const char = text[pos];
      
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
      } else if (char === '\\' && braceCount === 0) {
        // Check if this is \end{equation}
        const remainingText = text.substring(pos);
        if (remainingText.startsWith('\\end{equation}')) {
          const endIndex = pos + '\\end{equation}'.length;
          const fullEquation = text.substring(startIndex, endIndex);
          
          const element: LatexElement = {
            content: fullEquation,
            startIndex: startIndex,
            endIndex: endIndex,
            type: 'equation'
          };
          elements.push(element);
          foundEnd = true;
          break;
        }
      }
      
      pos++;
    }
    
    if (!foundEnd) {
      // If we didn't find the end, treat it as a command
      const element: LatexElement = {
        content: beginTag,
        startIndex: startIndex,
        endIndex: startIndex + beginTag.length,
        type: 'command'
      };
      elements.push(element);
    }
  }

  // Now process commands - find all \command patterns
  const commandRegex = /\\[a-zA-Z0-9]+/g;
  let commandMatch;
  while ((commandMatch = commandRegex.exec(text)) !== null) {
    const commandStart = commandMatch.index;
    const commandName = commandMatch[0];
    
    // Skip if this command is already part of an equation environment
    const isInEquation = elements.some(element => 
      element.type === 'equation' && 
      commandStart >= element.startIndex && 
      commandStart < element.endIndex
    );
    
    if (isInEquation) {
      continue;
    }
    
    // Find the end of this command by parsing its parameters
    let pos = commandStart + commandName.length;
    let braceCount = 0;
    let bracketCount = 0;
    let inBrace = false;
    let inBracket = false;
    
    // Skip whitespace
    while (pos < text.length && /\s/.test(text[pos])) {
      pos++;
    }
    
    // Parse parameters
    while (pos < text.length) {
      const char = text[pos];
      
      if (char === '[' && !inBrace) {
        bracketCount++;
        inBracket = true;
      } else if (char === ']' && inBracket) {
        bracketCount--;
        if (bracketCount === 0) {
          inBracket = false;
        }
      } else if (char === '{' && !inBracket) {
        braceCount++;
        inBrace = true;
      } else if (char === '}' && inBrace) {
        braceCount--;
        if (braceCount === 0) {
          inBrace = false;
        }
      } else if (!inBrace && !inBracket && /\s/.test(char)) {
        // If we're not in braces or brackets and hit whitespace, we're done
        break;
      } else if (!inBrace && !inBracket && !/\s/.test(char)) {
        // If we're not in braces or brackets and hit a non-whitespace character, 
        // and we haven't found any parameters yet, stop here
        if (braceCount === 0 && bracketCount === 0) {
          break;
        }
      }
      
      pos++;
    }
    
    // Extract the full command
    const fullCommand = text.substring(commandStart, pos);
    
    const element: LatexElement = {
      content: fullCommand,
      startIndex: commandStart,
      endIndex: pos,
      type: 'command'
    };
    
    // Extract command structure
    const structure = extractCommandStructure(fullCommand);
    if (structure) {
      element.commandStructure = structure.structure;
      element.commandName = structure.commandName;
    }
    
    elements.push(element);
  }

  // Sort by start index to maintain order
  const sorted = elements.sort((a, b) => a.startIndex - b.startIndex);

  // Filter out overlapping elements - keep the most specific (earlier in patterns array)
  const filtered: LatexElement[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    let shouldKeep = true;
    
    // Check if this element overlaps with any previously kept element
    for (let j = 0; j < filtered.length; j++) {
      const previous = filtered[j];
      
      // Check for overlap
      const overlaps = !(current.endIndex <= previous.startIndex || current.startIndex >= previous.endIndex);
      
      if (overlaps) {
        // Define priority order: equation > math-display > math > command
        const getPriority = (type: string) => {
          switch (type) {
            case 'equation': return 4;
            case 'math-display': return 3;
            case 'math': return 2;
            case 'command': return 1;
            default: return 0;
          }
        };
        
        const currentPriority = getPriority(current.type);
        const previousPriority = getPriority(previous.type);
        
        if (currentPriority <= previousPriority) {
          // Current element is less specific or same specificity, skip it
          shouldKeep = false;
          break;
        } else {
          // Current element is more specific, remove the previous one
          filtered.splice(j, 1);
          j--; // Adjust index after removal
        }
      }
    }
    
    if (shouldKeep) {
      filtered.push(current);
    }
  }
  
  return filtered;
}

export function highlightLatexText(text: string, elements: LatexElement[]): string {
  if (elements.length === 0) return text;

  let result = '';
  let lastIndex = 0;

  elements.forEach(element => {
    result += text.slice(lastIndex, element.startIndex);
    
    const className = `latex-${element.type}`;
    result += `<span class="${className}">${element.content}</span>`;
    
    lastIndex = element.endIndex;
  });

  result += text.slice(lastIndex);
  
  return result;
}

export function compareLatexElements(originalElements: LatexElement[], translatedElements: LatexElement[]): {
  missing: LatexElement[];
  different: LatexElement[];
} {
  // Guard: ensure both arrays are available
  if (!originalElements || !translatedElements || originalElements.length === 0) {
    return { missing: [], different: [] };
  }

  // Reset arrays at the beginning of each call
  const missing: LatexElement[] = [];
  const different: LatexElement[] = [];

  // Multiset matching for commands
  const originalCommands = originalElements.filter(e => e.type === 'command' && e.commandStructure);
  const translatedCommands = translatedElements.filter(e => e.type === 'command' && e.commandStructure);
  const usedTranslated = new Array(translatedCommands.length).fill(false);

  originalCommands.forEach(origCmd => {
    let found = false;
    
    for (let i = 0; i < translatedCommands.length; i++) {
      if (usedTranslated[i]) continue;
      const transCmd = translatedCommands[i];
      
      // Check if this is an environment command (begin/end)
      const isEnvironmentCommand = origCmd.commandName === 'begin' || origCmd.commandName === 'end';
      
      let isValidMatch = false;
      
      if (isEnvironmentCommand) {
        // For environment commands, check that the environment name inside braces matches exactly
        const origEnvMatch = origCmd.content.match(/\{([^}]*)\}/);
        const transEnvMatch = transCmd.content.match(/\{([^}]*)\}/);
        
        isValidMatch = origCmd.commandStructure === transCmd.commandStructure &&
                      origCmd.commandName === transCmd.commandName &&
                      origEnvMatch !== null && transEnvMatch !== null &&
                      origEnvMatch[1] === transEnvMatch[1];
      } else {
        // Check if this is a command that requires exact content matching
        const requiresExactMatch = origCmd.commandName === 'label' || 
                                  origCmd.commandName === 'ref' || 
                                  origCmd.commandName === 'cite' ||
                                  origCmd.commandName === 'citet';
        
        if (requiresExactMatch) {
          // For label, ref, cite commands, require exact content matching
          isValidMatch = transCmd.commandStructure === origCmd.commandStructure &&
                        transCmd.commandName === origCmd.commandName &&
                        transCmd.content === origCmd.content;
        } else {
          // For regular commands, check structure and name (content can be translated)
          isValidMatch = transCmd.commandStructure === origCmd.commandStructure &&
                        transCmd.commandName === origCmd.commandName;
        }
      }
      
      if (isValidMatch) {
        usedTranslated[i] = true;
        found = true;
        break;
      }
    }
    if (!found) {
      missing.push(origCmd);
    }
  });

  // Also check for extra commands in translation that don't exist in original
  const usedOriginal = new Array(originalCommands.length).fill(false);
  
  translatedCommands.forEach(transCmd => {
    let found = false;
    for (let i = 0; i < originalCommands.length; i++) {
      if (usedOriginal[i]) continue;
      const origCmd = originalCommands[i];
      
      // Check if this is an environment command (begin/end)
      const isEnvironmentCommand = transCmd.commandName === 'begin' || transCmd.commandName === 'end';
      
      let isValidMatch = false;
      
      if (isEnvironmentCommand) {
        // For environment commands, check that the environment name inside braces matches exactly
        const transEnvMatch = transCmd.content.match(/\{([^}]*)\}/);
        const origEnvMatch = origCmd.content.match(/\{([^}]*)\}/);
        
        isValidMatch = transCmd.commandStructure === origCmd.commandStructure &&
                      transCmd.commandName === origCmd.commandName &&
                      transEnvMatch !== null && origEnvMatch !== null &&
                      transEnvMatch[1] === origEnvMatch[1];
      } else {
        // Check if this is a command that requires exact content matching
        const requiresExactMatch = transCmd.commandName === 'label' || 
                                  transCmd.commandName === 'ref' || 
                                  transCmd.commandName === 'cite' ||
                                  transCmd.commandName === 'citet';
        
        if (requiresExactMatch) {
          // For label, ref, cite commands, require exact content matching
          isValidMatch = transCmd.commandStructure === origCmd.commandStructure &&
                        transCmd.commandName === origCmd.commandName &&
                        transCmd.content === origCmd.content;
        } else {
          // For regular commands, check structure and name (content can be translated)
          isValidMatch = transCmd.commandStructure === origCmd.commandStructure &&
                        transCmd.commandName === origCmd.commandName;
        }
      }
      
      if (isValidMatch) {
        usedOriginal[i] = true;
        found = true;
        break;
      }
    }
    if (!found) {
      // This translated command doesn't exist in original, mark it as different
      different.push(transCmd);
    }
  });

  // Handle non-command elements (math, equations, etc.)
  const nonCommandOriginal = originalElements.filter(e => e.type !== 'command');
  const nonCommandTranslated = translatedElements.filter(e => e.type !== 'command');
  
  nonCommandOriginal.forEach(original => {
    if (original.type === 'equation') {
      // For equation environments, require exact content matching
      const matching = nonCommandTranslated.find(translated => 
        translated.type === 'equation' &&
        translated.content === original.content
      );

      if (!matching) {
        missing.push(original);
      } else if (matching.type !== original.type) {
        different.push(original);
      }
    } else if (original.type === 'math' || original.type === 'math-display') {
      // For math expressions, require exact content matching
      const matching = nonCommandTranslated.find(translated => 
        (translated.type === 'math' || translated.type === 'math-display') &&
        translated.content === original.content
      );

      if (!matching) {
        missing.push(original);
      } else if (matching.type !== original.type) {
        different.push(original);
      }
    } else {
      // For other elements, use exact matching
      const matching = nonCommandTranslated.find(translated => 
        translated.content === original.content
      );

      if (!matching) {
        missing.push(original);
      } else if (matching.type !== original.type) {
        different.push(original);
      }
    }
  });

  return { missing, different };
}

export function highlightWithValidation(
  text: string, 
  elements: LatexElement[], 
  missingElements: LatexElement[]
): string {
  if (elements.length === 0) return text;

  let result = '';
  let lastIndex = 0;

  elements.forEach(element => {
    // Check if this element is missing in translation
    const isMissing = missingElements.some(missing => {
      // For exact matching, compare the actual element instances
      if (element.startIndex === missing.startIndex && 
          element.endIndex === missing.endIndex &&
          element.content === missing.content) {
        return true;
      }
      
      // For command elements, also check structure and name
      if (element.type === 'command' && missing.type === 'command') {
        const isEnvironmentCommand = element.commandName === 'begin' || element.commandName === 'end';
        
        if (isEnvironmentCommand) {
          // For environment commands, check that the environment name inside braces matches exactly
          const elementEnvMatch = element.content.match(/\{([^}]*)\}/);
          const missingEnvMatch = missing.content.match(/\{([^}]*)\}/);
          
          const envMatch = element.commandStructure === missing.commandStructure &&
                 element.commandName === missing.commandName &&
                 elementEnvMatch !== null && missingEnvMatch !== null &&
                 elementEnvMatch[1] === missingEnvMatch[1];
          
          return envMatch;
        } else {
          // Check if this is a command that requires exact content matching
          const requiresExactMatch = element.commandName === 'label' || 
                                    element.commandName === 'ref' || 
                                    element.commandName === 'cite' ||
                                    element.commandName === 'citet';
          
          if (requiresExactMatch) {
            // For label, ref, cite commands, require exact content matching
            const cmdMatch = element.commandStructure === missing.commandStructure &&
                   element.commandName === missing.commandName &&
                   element.content === missing.content;
            return cmdMatch;
          } else {
            // For regular commands, compare structure and name
            const cmdMatch = element.commandStructure === missing.commandStructure &&
                   element.commandName === missing.commandName;
            return cmdMatch;
          }
        }
      } else if (element.type === 'equation' && missing.type === 'equation') {
        // For equation environments, compare exact content
        const eqMatch = element.content === missing.content;
        return eqMatch;
      } else if ((element.type === 'math' || element.type === 'math-display') && 
                 (missing.type === 'math' || missing.type === 'math-display')) {
        // For math expressions, compare exact content
        const mathMatch = element.content === missing.content;
        return mathMatch;
      } else {
        // For other elements, compare exact content
        const otherMatch = missing.content === element.content;
        return otherMatch;
      }
    });
    
    // Add text before the LaTeX element
    result += text.slice(lastIndex, element.startIndex);
    
    // Add the highlighted LaTeX element with validation styling
    const baseClass = `latex-${element.type}`;
    const validationClass = isMissing ? 'latex-missing' : '';
    const className = `${baseClass} ${validationClass}`.trim();
    
    result += `<span class="${className}">${element.content}</span>`;
    
    lastIndex = element.endIndex;
  });

  // Add remaining text
  result += text.slice(lastIndex);
  
  return result;
}

// Enhanced comparison to find specific missing parts
export function findMissingParts(originalElement: LatexElement, translatedText: string): {
  element: LatexElement;
  missingParts: Array<{start: number, end: number, content: string}>;
} {
  const missingParts: Array<{start: number, end: number, content: string}> = [];
  
  if (originalElement.type === 'command' && originalElement.commandStructure) {  
    // If we have fewer matches than expected, this instance is missing
    // For now, mark the entire command as missing
    missingParts.push({
      start: 0,
      end: originalElement.content.length,
      content: originalElement.content
    });
  } else if (originalElement.type === 'math' || originalElement.type === 'math-display') {
    // For math expressions, find the exact content in translated text
    const mathContent = originalElement.content;
    const translatedIndex = translatedText.indexOf(mathContent);
    
    if (translatedIndex === -1) {
      // Math expression not found, mark entire content as missing
      missingParts.push({
        start: 0,
        end: mathContent.length,
        content: mathContent
      });
    }
  } else if (originalElement.type === 'equation') {
    // For equation environments, find differences
    const equationContent = originalElement.content;
    const translatedIndex = translatedText.indexOf(equationContent);
    
    if (translatedIndex === -1) {
      // Equation not found, mark entire content as missing
      missingParts.push({
        start: 0,
        end: equationContent.length,
        content: equationContent
      });
    }
  }
  
  return {
    element: originalElement,
    missingParts
  };
}

// Enhanced highlighting with detailed validation
export function highlightWithDetailedValidation(
  text: string, 
  elements: LatexElement[], 
  missingElements: LatexElement[],
  translatedText: string
): string {
  if (elements.length === 0) return text;

  let result = '';
  let lastIndex = 0;

  elements.forEach(element => {
    // Check if this element is missing in translation
    const isMissing = missingElements.some(missing => {
      // For exact matching, compare the actual element instances
      if (element.startIndex === missing.startIndex && 
          element.endIndex === missing.endIndex &&
          element.content === missing.content) {
        return true;
      }
      
      // For command elements, also check structure and name
      if (element.type === 'command' && missing.type === 'command') {
        const isEnvironmentCommand = element.commandName === 'begin' || element.commandName === 'end';
        
        if (isEnvironmentCommand) {
          // For environment commands, check that the environment name inside braces matches exactly
          const elementEnvMatch = element.content.match(/\{([^}]*)\}/);
          const missingEnvMatch = missing.content.match(/\{([^}]*)\}/);
          
          return element.commandStructure === missing.commandStructure &&
                 element.commandName === missing.commandName &&
                 elementEnvMatch !== null && missingEnvMatch !== null &&
                 elementEnvMatch[1] === missingEnvMatch[1];
        } else {
          // Check if this is a command that requires exact content matching
          const requiresExactMatch = element.commandName === 'label' || 
                                    element.commandName === 'ref' || 
                                    element.commandName === 'cite' ||
                                    element.commandName === 'citet';
          
          if (requiresExactMatch) {
            // For label, ref, cite commands, require exact content matching
            const cmdMatch = element.commandStructure === missing.commandStructure &&
                   element.commandName === missing.commandName &&
                   element.content === missing.content;
            return cmdMatch;
          } else {
            // For regular commands, compare structure and name
            const cmdMatch = element.commandStructure === missing.commandStructure &&
                   element.commandName === missing.commandName;
            return cmdMatch;
          }
        }
      } else if (element.type === 'equation' && missing.type === 'equation') {
        // For equation environments, compare exact content
        return element.content === missing.content;
      } else if ((element.type === 'math' || element.type === 'math-display') && 
                 (missing.type === 'math' || missing.type === 'math-display')) {
        // For math expressions, compare exact content
        return element.content === missing.content;
      } else {
        // For other elements, compare exact content
        return missing.content === element.content;
      }
    });
    
    // Add text before the LaTeX element
    result += text.slice(lastIndex, element.startIndex);
    
    if (isMissing) {
      // Find specific missing parts
      const missingInfo = findMissingParts(element, translatedText);
      let highlightedContent = element.content;
      
      // Apply bold highlighting to missing parts (in reverse order to maintain indices)
      missingInfo.missingParts
        .sort((a, b) => b.start - a.start) // Reverse order
        .forEach(part => {
          const before = highlightedContent.substring(0, part.start);
          const boldPart = `<strong>${part.content}</strong>`;
          const after = highlightedContent.substring(part.end);
          highlightedContent = before + boldPart + after;
        });
      
      // Add the highlighted LaTeX element with validation styling
      const baseClass = `latex-${element.type}`;
      const validationClass = 'latex-missing';
      const className = `${baseClass} ${validationClass}`.trim();
      
      result += `<span class="${className}">${highlightedContent}</span>`;
    } else {
      // Add the highlighted LaTeX element without validation styling
      const className = `latex-${element.type}`;
      result += `<span class="${className}">${element.content}</span>`;
    }
    
    lastIndex = element.endIndex;
  });

  // Add remaining text
  result += text.slice(lastIndex);
  
  return result;
} 