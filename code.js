// Design System Auditor - ES5 Compatible Version
// Comprehensive Intelligence Plugin for Figma

var DesignSystemAuditor = function() {
  this.designSystem = null;
  this.tolerance = 0.1;
  this.textStyleMap = new Map();
  this.componentMap = new Map();
  this.dsAtomPatterns = new Map();
  this.customComponentRegistry = new Map();
};

// Load design system from JSON data (from UI file upload)
DesignSystemAuditor.prototype.loadDesignSystemFromJSON = function(designSystemData) {
  var self = this;

  try {
    // Accept the design system data directly
    self.designSystem = designSystemData;

    // Build maps and patterns
    self.buildTextStyleMap();
    self.buildComponentMap();
    self.buildAtomicPatterns();
    self.catalogDesignSystemComponents();

    var stats = self.getDesignSystemStats();
    console.log('✅ Design system loaded from JSON:', stats);

    return {
      success: true,
      stats: stats,
      metadata: {
        source: self.designSystem.name || 'Design System',
        version: self.designSystem.version || '1.0',
        lastModified: self.designSystem.lastModified || new Date().toISOString(),
        atomicComponents: self.getAtomicComponentCount(),
        patterns: self.getPatternCount()
      }
    };
  } catch (error) {
    console.error('❌ Failed to load design system from JSON:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Extract design system from current Figma file
DesignSystemAuditor.prototype.extractDesignSystemFromFigma = function() {
  var self = this;

  return Promise.all([
    figma.getLocalPaintStylesAsync(),
    figma.getLocalTextStylesAsync(),
    figma.getLocalEffectStylesAsync()
  ]).then(function(results) {
    var paintStyles = results[0];
    var textStyles = results[1];
    var effectStyles = results[2];

    self.designSystem = {
      name: figma.root.name + ' Design System',
      version: '1.0',
      lastModified: new Date().toISOString(),
      paintStyles: paintStyles.map(function(style) {
        return {
          name: style.name,
          id: style.id,
          paints: style.paints
        };
      }),
      textStyles: textStyles.map(function(style) {
        return {
          name: style.name,
          id: style.id,
          style: {
            fontFamily: style.fontName ? style.fontName.family : 'Unknown',
            fontSize: style.fontSize || 16,
            fontWeight: style.fontName ? style.fontName.style : 'Regular'
          }
        };
      }),
      effectStyles: effectStyles.map(function(style) {
        return {
          name: style.name,
          id: style.id,
          effects: style.effects
        };
      }),
      components: []
    };

    // Build maps and patterns
    self.buildTextStyleMap();
    self.buildComponentMap();
    self.buildAtomicPatterns();
    self.catalogDesignSystemComponents();

    var stats = self.getDesignSystemStats();
    console.log('✅ Design system extracted from Figma:', stats);

    return {
      success: true,
      stats: stats,
      metadata: {
        source: self.designSystem.name,
        version: self.designSystem.version,
        lastModified: self.designSystem.lastModified,
        atomicComponents: self.getAtomicComponentCount(),
        patterns: self.getPatternCount()
      }
    };
  }).catch(function(error) {
    console.error('❌ Failed to extract design system:', error);
    return {
      success: false,
      error: error.message
    };
  });
};

DesignSystemAuditor.prototype.loadDesignSystem = function() {
  return this.extractDesignSystemFromFigma();
};

// Build atomic design system patterns
DesignSystemAuditor.prototype.buildAtomicPatterns = function() {
  var self = this;
  this.dsAtomPatterns.clear();

  if (this.designSystem.paintStyles) {
    this.dsAtomPatterns.set('colors', new Set(
      this.designSystem.paintStyles.map(function(style) {
        return self.normalizeColorForComparison(style);
      })
    ));
  }

  if (this.designSystem.textStyles) {
    this.dsAtomPatterns.set('typography', new Set(
      this.designSystem.textStyles.map(function(style) {
        return self.normalizeTypographyForComparison(style);
      })
    ));
  }

  if (this.designSystem.spacingScale) {
    this.dsAtomPatterns.set('spacing', new Set(this.designSystem.spacingScale));
  }

  if (this.designSystem.effectStyles) {
    this.dsAtomPatterns.set('effects', new Set(
      this.designSystem.effectStyles.map(function(style) {
        return self.normalizeEffectForComparison(style);
      })
    ));
  }
};

// Catalog all design system components
DesignSystemAuditor.prototype.catalogDesignSystemComponents = function() {
  this.customComponentRegistry.clear();

  if (!this.designSystem.components) return;

  for (var i = 0; i < this.designSystem.components.length; i++) {
    var component = this.designSystem.components[i];
    var componentType = this.getComponentType(component);
    var normalizedName = component.name.toLowerCase();

    if (!this.customComponentRegistry.has(componentType)) {
      this.customComponentRegistry.set(componentType, new Set());
    }

    this.customComponentRegistry.get(componentType).add({
      name: component.name,
      normalizedName: normalizedName,
      id: component.id,
      variants: this.extractComponentVariants(component)
    });
  }
};

// Extract component variants
DesignSystemAuditor.prototype.extractComponentVariants = function(component) {
  var variants = {
    sizes: new Set(),
    states: new Set(),
    styles: new Set()
  };

  var name = component.name.toLowerCase();

  var sizes = ['small', 'medium', 'large', 'xl', 'xs', 'sm', 'lg'];
  for (var i = 0; i < sizes.length; i++) {
    if (name.includes(sizes[i])) variants.sizes.add(sizes[i]);
  }

  var states = ['default', 'hover', 'active', 'disabled', 'focus', 'pressed'];
  for (var i = 0; i < states.length; i++) {
    if (name.includes(states[i])) variants.states.add(states[i]);
  }

  var styles = ['primary', 'secondary', 'tertiary', 'outline', 'ghost', 'solid'];
  for (var i = 0; i < styles.length; i++) {
    if (name.includes(styles[i])) variants.styles.add(styles[i]);
  }

  return variants;
};

// MAIN ANALYSIS ENGINE
DesignSystemAuditor.prototype.analyzeNode = function(node) {
  var issues = [];
  var currentPath = this.getNodePath(node);

  if (node.visible === false) return issues;

  console.log('🔍 Analyzing: ' + node.name + ' (' + node.type + ')');

  // 1. ATOMIC COMPLIANCE CHECK
  var atomicIssues = this.analyzeAtomicCompliance(node, currentPath);
  issues = issues.concat(atomicIssues);

  // 2. COMPONENT INTELLIGENCE CHECK
  var componentIssues = this.analyzeComponentIntelligence(node, currentPath);
  issues = issues.concat(componentIssues);

  // 3. COMPOSITE COMPONENT CHECK
  var compositeIssues = this.analyzeCompositeComponentCompliance(node, currentPath);
  issues = issues.concat(compositeIssues);

  // 4. DESIGN SYSTEM COMPONENT DUPLICATION CHECK
  var duplicationIssues = this.analyzeDesignSystemDuplication(node, currentPath);
  issues = issues.concat(duplicationIssues);

  // 5. PATTERN CONSISTENCY CHECK
  var patternIssues = this.analyzePatternConsistency(node, currentPath);
  issues = issues.concat(patternIssues);

  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      var childIssues = this.analyzeNode(node.children[i]);
      issues = issues.concat(childIssues);
    }
  }

  return issues;
};

// Atomic compliance analysis
DesignSystemAuditor.prototype.analyzeAtomicCompliance = function(node, currentPath) {
  var issues = [];

  var colorIssues = this.analyzeSmartColorCompliance(node, currentPath);
  issues = issues.concat(colorIssues);

  var typographyIssues = this.analyzeSmartTypographyCompliance(node, currentPath);
  issues = issues.concat(typographyIssues);

  var effectIssues = this.analyzeEffectCompliance(node, currentPath);
  issues = issues.concat(effectIssues);

  var spacingIssues = this.analyzeSpacingCompliance(node, currentPath);
  issues = issues.concat(spacingIssues);

  return issues;
};

// Component intelligence analysis
DesignSystemAuditor.prototype.analyzeComponentIntelligence = function(node, currentPath) {
  var issues = [];

  var detectedComponent = this.detectComponentType(node);

  if (detectedComponent.type !== 'unknown' && detectedComponent.confidence >= 60) {
    console.log('🎯 Detected: ' + detectedComponent.type + ' (confidence: ' + detectedComponent.confidence + '%)');

    var isUsingDS = this.isUsingDesignSystemComponent(node, detectedComponent.type);

    if (!isUsingDS) {
      var dsHasComponent = this.designSystemHasComponentType(detectedComponent.type);

      if (dsHasComponent) {
        issues.push({
          type: 'component-replacement',
          subtype: detectedComponent.type,
          severity: this.getComponentSeverity(detectedComponent.type),
          message: 'Custom ' + detectedComponent.type + ' detected - should use design system ' + detectedComponent.suggestedComponent,
          node: node,
          path: currentPath,
          nodeId: node.id,
          detectedType: detectedComponent.type,
          suggestedComponent: detectedComponent.suggestedComponent,
          confidence: detectedComponent.confidence,
          reasoning: detectedComponent.reasoning,
          autoFixable: false,
          properties: detectedComponent.properties
        });
      } else {
        console.log('ℹ️ No DS component for ' + detectedComponent.type + ' - will check atomic compliance instead');
      }
    }
  }

  return issues;
};

// Composite component compliance
DesignSystemAuditor.prototype.analyzeCompositeComponentCompliance = function(node, currentPath) {
  var issues = [];

  var isComposite = this.isCompositeComponent(node);

  if (isComposite.isComposite) {
    console.log('🏗️ Composite component detected: ' + isComposite.type);

    var isDS = this.isDesignSystemComponent(node);

    if (!isDS) {
      var atomicCompliance = this.analyzeCompositeAtomicUsage(node);

      if (atomicCompliance.nonCompliantAtoms > 0) {
        issues.push({
          type: 'composite-compliance',
          subtype: isComposite.type,
          severity: 'medium',
          message: 'Custom ' + isComposite.type + ' component should use design system atoms (' + atomicCompliance.nonCompliantAtoms + ' non-compliant elements)',
          node: node,
          path: currentPath,
          nodeId: node.id,
          compositeType: isComposite.type,
          nonCompliantAtoms: atomicCompliance.violations,
          totalElements: atomicCompliance.totalElements,
          complianceScore: atomicCompliance.complianceScore,
          autoFixable: false,
          recommendations: atomicCompliance.recommendations
        });
      }
    }
  }

  return issues;
};

// Design system duplication detection
DesignSystemAuditor.prototype.analyzeDesignSystemDuplication = function(node, currentPath) {
  var issues = [];

  var commonComponents = ['button', 'input', 'checkbox', 'radio', 'dropdown', 'toggle', 'slider', 'searchbox'];

  for (var i = 0; i < commonComponents.length; i++) {
    var componentType = commonComponents[i];
    var detection = this.detectSpecificComponent(node, componentType);

    if (detection.isComponent && detection.confidence >= 70) {
      var dsHasComponent = this.designSystemHasComponentType(componentType);

      if (dsHasComponent) {
        var isUsingDS = this.isUsingDesignSystemComponent(node, componentType);

        if (!isUsingDS) {
          var dsComponent = this.findMatchingDSComponent(node, componentType);

          issues.push({
            type: 'ds-duplication',
            subtype: componentType,
            severity: 'high',
            message: 'Custom ' + componentType + ' component duplicates existing design system component "' + dsComponent.name + '"',
            node: node,
            path: currentPath,
            nodeId: node.id,
            componentType: componentType,
            dsComponentName: dsComponent.name,
            dsComponentId: dsComponent.id,
            confidence: detection.confidence,
            visualSimilarity: dsComponent.similarity,
            autoFixable: false,
            recommendation: 'Replace with DS component: ' + dsComponent.name
          });
        }
      }
    }
  }

  return issues;
};

// Pattern consistency analysis
DesignSystemAuditor.prototype.analyzePatternConsistency = function(node, currentPath) {
  var issues = [];

  var patterns = this.detectPatternsInNode(node);

  for (var i = 0; i < patterns.length; i++) {
    var pattern = patterns[i];
    if (pattern.hasInconsistency) {
      issues.push({
        type: 'pattern-inconsistency',
        subtype: pattern.type,
        severity: 'medium',
        message: pattern.message,
        node: node,
        path: currentPath,
        nodeId: node.id,
        patternType: pattern.type,
        inconsistencyDetails: pattern.details,
        autoFixable: pattern.autoFixable,
        suggestions: pattern.suggestions
      });
    }
  }

  return issues;
};

// Enhanced component detection
DesignSystemAuditor.prototype.detectComponentType = function(node) {
  var detectors = [
    this.detectButton,
    this.detectInput,
    this.detectCheckbox,
    this.detectRadioButton,
    this.detectSearchBox
  ];

  var bestDetection = { type: 'unknown', confidence: 0, properties: {}, reasoning: '', suggestedComponent: null };

  for (var i = 0; i < detectors.length; i++) {
    var detection = detectors[i].call(this, node);
    if (detection.confidence > bestDetection.confidence) {
      bestDetection = detection;
    }
  }

  return bestDetection;
};

// Button detection
DesignSystemAuditor.prototype.detectButton = function(node) {
  var nodeName = (node.name || '').toLowerCase();
  var properties = {
    hasBackground: false,
    hasText: false,
    hasIcon: false,
    hasStates: false,
    size: 'medium',
    variant: 'primary',
    width: node.width,
    height: node.height,
    cornerRadius: node.cornerRadius || 0,
    interactive: false
  };

  var confidence = 0;
  var reasoning = [];

  if (nodeName.includes('button') || nodeName.includes('btn')) {
    confidence += 50;
    reasoning.push('name contains button');
  }

  var actionWords = ['submit', 'confirm', 'cancel', 'save', 'edit', 'delete', 'add', 'create',
                    'send', 'login', 'signup', 'download', 'upload', 'next', 'previous',
                    'continue', 'finish', 'close', 'open', 'play', 'pause', 'stop'];
  for (var i = 0; i < actionWords.length; i++) {
    if (nodeName.includes(actionWords[i])) {
      confidence += 35;
      reasoning.push('action-oriented name');
      properties.interactive = true;
      break;
    }
  }

  if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {

    if (node.fills && node.fills.length > 0) {
      var visibleFills = node.fills.filter(function(fill) {
        return fill.visible !== false && (fill.opacity || 1) > 0;
      });
      if (visibleFills.length > 0) {
        properties.hasBackground = true;
        confidence += 25;
        reasoning.push('has background');
      }
    }

    if (this.hasTextChild(node)) {
      properties.hasText = true;
      confidence += 30;
      reasoning.push('contains text');

      var textContent = this.getTextContent(node).toLowerCase();
      for (var i = 0; i < actionWords.length; i++) {
        if (textContent.includes(actionWords[i])) {
          confidence += 15;
          reasoning.push('button-like text content');
          break;
        }
      }
    }

    if (this.hasIconChild(node)) {
      properties.hasIcon = true;
      confidence += 20;
      reasoning.push('contains icon');
    }

    var reasonableButtonSize = node.width >= 60 && node.width <= 500 &&
                              node.height >= 24 && node.height <= 100;
    if (reasonableButtonSize) {
      confidence += 25;
      reasoning.push('button-like dimensions');
    }

    var aspectRatio = node.width / node.height;
    if (aspectRatio >= 1.5 && aspectRatio <= 8) {
      confidence += 15;
      reasoning.push('button-like aspect ratio');
    }

    if (node.cornerRadius && node.cornerRadius > 0) {
      confidence += 20;
      reasoning.push('rounded corners');
    }

    if (node.strokes && node.strokes.length > 0) {
      var visibleStrokes = node.strokes.filter(function(stroke) {
        return stroke.visible !== false;
      });
      if (visibleStrokes.length > 0) {
        confidence += 15;
        reasoning.push('has border');
      }
    }

    properties.variant = this.detectButtonVariant(node);
    properties.size = this.detectButtonSize(node);

    if (this.isInInteractiveContext(node)) {
      confidence += 20;
      reasoning.push('in interactive context');
    }

    if (this.hasStateVariations(node)) {
      properties.hasStates = true;
      confidence += 25;
      reasoning.push('has state variations');
    }

    var keyCharacteristics = [
      properties.hasBackground,
      properties.hasText,
      reasonableButtonSize,
      properties.interactive
    ];

    var characteristicCount = keyCharacteristics.filter(Boolean).length;
    if (characteristicCount >= 3) {
      confidence += 20;
      reasoning.push('multiple button characteristics');
    }
  }

  var suggestedComponent = confidence >= 60 ? this.getSuggestedButtonComponent(properties) : null;

  return {
    type: 'button',
    confidence: Math.min(confidence, 100),
    properties: properties,
    reasoning: reasoning.join(', '),
    suggestedComponent: suggestedComponent
  };
};

// Input detection
DesignSystemAuditor.prototype.detectInput = function(node) {
  var nodeName = (node.name || '').toLowerCase();
  var confidence = 0;
  var reasoning = [];
  var properties = {
    hasBackground: false,
    hasBorder: false,
    hasPlaceholder: false,
    inputType: 'text'
  };

  if (nodeName.includes('input') || nodeName.includes('field') || nodeName.includes('textbox') ||
      nodeName.includes('textarea') || nodeName.includes('form')) {
    confidence += 50;
    reasoning.push('input-related name');
  }

  if (nodeName.includes('email') || nodeName.includes('password') || nodeName.includes('search')) {
    confidence += 30;
    reasoning.push('specific input type');
    properties.inputType = nodeName.includes('email') ? 'email' :
                         nodeName.includes('password') ? 'password' : 'search';
  }

  if (node.type === 'FRAME') {
    var inputLikeSize = node.width >= 120 && node.height >= 24 &&
                       node.height <= 80 && node.width > node.height * 2;
    if (inputLikeSize) {
      confidence += 30;
      reasoning.push('input-like dimensions');
    }

    if (node.fills && node.fills.length > 0) {
      properties.hasBackground = true;
      confidence += 15;
      reasoning.push('has background');
    }

    if (node.strokes && node.strokes.length > 0) {
      properties.hasBorder = true;
      confidence += 25;
      reasoning.push('has border');
    }

    if (this.hasTextChild(node)) {
      properties.hasPlaceholder = true;
      confidence += 15;
      reasoning.push('contains text/placeholder');
    }

    if (node.cornerRadius && node.cornerRadius <= 12) {
      confidence += 10;
      reasoning.push('slight corner radius');
    }
  }

  var suggestedComponent = confidence >= 60 ? 'Input/' + properties.inputType : null;

  return {
    type: 'input',
    confidence: Math.min(confidence, 100),
    properties: properties,
    reasoning: reasoning.join(', '),
    suggestedComponent: suggestedComponent
  };
};

// Checkbox detection
DesignSystemAuditor.prototype.detectCheckbox = function(node) {
  var nodeName = (node.name || '').toLowerCase();
  var confidence = 0;
  var reasoning = [];
  var properties = {
    isChecked: false,
    hasLabel: false,
    size: 'medium'
  };

  if (nodeName.includes('checkbox') || nodeName.includes('check')) {
    confidence += 60;
    reasoning.push('checkbox name');
  }

  if (node.type === 'FRAME' || node.type === 'COMPONENT') {
    var isSquarish = Math.abs(node.width - node.height) <= 4 &&
                    node.width >= 12 && node.width <= 32;
    if (isSquarish) {
      confidence += 35;
      reasoning.push('square dimensions');

      properties.size = node.width <= 16 ? 'small' :
                       node.width <= 24 ? 'medium' : 'large';
    }

    if (node.strokes && node.strokes.length > 0) {
      confidence += 20;
      reasoning.push('has border');
    }

    if (this.hasCheckmarkIndicator(node)) {
      properties.isChecked = true;
      confidence += 25;
      reasoning.push('has checkmark');
    }

    if (this.hasAdjacentLabel(node)) {
      properties.hasLabel = true;
      confidence += 15;
      reasoning.push('has label');
    }
  }

  var suggestedComponent = confidence >= 60 ? 'Checkbox/' + properties.size : null;

  return {
    type: 'checkbox',
    confidence: Math.min(confidence, 100),
    properties: properties,
    reasoning: reasoning.join(', '),
    suggestedComponent: suggestedComponent
  };
};

// Radio button detection
DesignSystemAuditor.prototype.detectRadioButton = function(node) {
  var nodeName = (node.name || '').toLowerCase();
  var confidence = 0;
  var reasoning = [];
  var properties = {
    isSelected: false,
    hasLabel: false,
    size: 'medium'
  };

  if (nodeName.includes('radio') || nodeName.includes('option')) {
    confidence += 60;
    reasoning.push('radio name');
  }

  if (node.type === 'FRAME' || node.type === 'COMPONENT') {
    var isCircular = Math.abs(node.width - node.height) <= 2 &&
                    node.width >= 12 && node.width <= 28;
    if (isCircular) {
      confidence += 35;
      reasoning.push('circular dimensions');

      properties.size = node.width <= 16 ? 'small' :
                       node.width <= 20 ? 'medium' : 'large';
    }

    if (node.cornerRadius && node.cornerRadius >= node.width / 2 - 2) {
      confidence += 25;
      reasoning.push('circular/rounded');
    }

    if (this.hasRadioIndicator(node)) {
      properties.isSelected = true;
      confidence += 25;
      reasoning.push('has selection indicator');
    }

    if (this.hasAdjacentLabel(node)) {
      properties.hasLabel = true;
      confidence += 15;
      reasoning.push('has label');
    }
  }

  var suggestedComponent = confidence >= 60 ? 'Radio/' + properties.size : null;

  return {
    type: 'radio',
    confidence: Math.min(confidence, 100),
    properties: properties,
    reasoning: reasoning.join(', '),
    suggestedComponent: suggestedComponent
  };
};

// Search box detection
DesignSystemAuditor.prototype.detectSearchBox = function(node) {
  var nodeName = (node.name || '').toLowerCase();
  var confidence = 0;
  var reasoning = [];
  var properties = {
    hasIcon: false,
    hasButton: false,
    placeholder: ''
  };

  if (nodeName.includes('search') || nodeName.includes('find')) {
    confidence += 50;
    reasoning.push('search name');
  }

  if (node.type === 'FRAME') {
    var searchLikeSize = node.width >= 200 && node.height >= 28 &&
                        node.height <= 60 && node.width > node.height * 3;
    if (searchLikeSize) {
      confidence += 30;
      reasoning.push('search box dimensions');
    }

    if (this.hasSearchIcon(node)) {
      properties.hasIcon = true;
      confidence += 30;
      reasoning.push('has search icon');
    }

    if (this.hasSearchButton(node)) {
      properties.hasButton = true;
      confidence += 20;
      reasoning.push('has search button');
    }

    var textContent = this.getTextContent(node).toLowerCase();
    if (textContent.includes('search') || textContent.includes('find') ||
        textContent.includes('type') || textContent.includes('enter')) {
      confidence += 20;
      reasoning.push('search-related placeholder');
      properties.placeholder = textContent;
    }
  }

  var suggestedComponent = confidence >= 60 ? 'SearchBox/Default' : null;

  return {
    type: 'searchbox',
    confidence: Math.min(confidence, 100),
    properties: properties,
    reasoning: reasoning.join(', '),
    suggestedComponent: suggestedComponent
  };
};

// Smart color compliance analysis
DesignSystemAuditor.prototype.analyzeSmartColorCompliance = function(node, currentPath) {
  var colorIssues = [];

  if (node.fills && node.fills.length > 0) {
    for (var i = 0; i < node.fills.length; i++) {
      var fill = node.fills[i];
      if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
        var context = this.buildEnhancedContext(node);
        var compliance = this.checkColorCompliance(fill.color, context);

        if (!compliance.isCompliant && compliance.suggestion) {
          colorIssues.push({
            type: 'color',
            severity: compliance.severity,
            message: compliance.contextDescription + ' color should use design system color "' + compliance.suggestion.name + '"',
            node: node,
            path: currentPath,
            nodeId: node.id,
            currentColor: fill.color,
            suggestedColor: compliance.suggestion.color,
            suggestedColorName: compliance.suggestion.name,
            confidence: compliance.confidence,
            context: context,
            reasoning: compliance.reasoning,
            autoFixable: true
          });
        }
      }
    }
  }

  if (node.strokes && node.strokes.length > 0) {
    for (var i = 0; i < node.strokes.length; i++) {
      var stroke = node.strokes[i];
      if (stroke.type === 'SOLID' && stroke.color && stroke.visible !== false) {
        var context = this.buildEnhancedContext(node, { isStroke: true });
        var compliance = this.checkColorCompliance(stroke.color, context);

        if (!compliance.isCompliant && compliance.suggestion) {
          colorIssues.push({
            type: 'color',
            severity: compliance.severity,
            message: 'Border color should use design system color "' + compliance.suggestion.name + '"',
            node: node,
            path: currentPath,
            nodeId: node.id,
            currentColor: stroke.color,
            suggestedColor: compliance.suggestion.color,
            suggestedColorName: compliance.suggestion.name,
            confidence: compliance.confidence,
            context: context,
            reasoning: compliance.reasoning,
            autoFixable: true
          });
        }
      }
    }
  }

  return colorIssues;
};

// Enhanced context building
DesignSystemAuditor.prototype.buildEnhancedContext = function(node, options) {
  options = options || {};
  var nodeName = (node.name || '').toLowerCase();
  var nodeType = node.type;
  var parent = node.parent;
  var parentName = parent ? (parent.name || '').toLowerCase() : '';

  return {
    isHeading: nodeName.includes('heading') || nodeName.includes('title') ||
              nodeName.includes('h1') || nodeName.includes('h2') || nodeName.includes('h3'),
    isButton: nodeName.includes('button') || nodeName.includes('btn'),
    isLabel: nodeName.includes('label') || nodeName.includes('caption'),
    isBackground: nodeName.includes('background') || nodeName.includes('bg') || nodeType === 'FRAME',
    isCard: nodeName.includes('card') || nodeName.includes('panel'),
    isFrame: nodeType === 'FRAME',
    isText: nodeType === 'TEXT',
    isStroke: options.isStroke || false,
    isIcon: nodeType === 'VECTOR' || nodeName.includes('icon'),
    isInput: nodeName.includes('input') || nodeName.includes('field'),
    isNavigation: nodeName.includes('nav') || nodeName.includes('menu') || parentName.includes('nav'),
    isHeader: nodeName.includes('header') || parentName.includes('header'),
    isFooter: nodeName.includes('footer') || parentName.includes('footer'),
    isSidebar: nodeName.includes('sidebar') || nodeName.includes('aside'),
    isModal: nodeName.includes('modal') || nodeName.includes('dialog'),
    isAlert: nodeName.includes('alert') || nodeName.includes('notification'),
    isSuccess: nodeName.includes('success') || nodeName.includes('complete'),
    isError: nodeName.includes('error') || nodeName.includes('danger') || nodeName.includes('warning'),
    isInfo: nodeName.includes('info') || nodeName.includes('help'),
    isPrimary: nodeName.includes('primary') || nodeName.includes('main'),
    isSecondary: nodeName.includes('secondary') || nodeName.includes('sub'),
    nodeType: nodeType,
    nodeName: nodeName,
    parentName: parentName,
    depth: this.getNodeDepth(node),
    hasChildren: node.children && node.children.length > 0,
    childCount: node.children ? node.children.length : 0
  };
};

// Check color compliance
DesignSystemAuditor.prototype.checkColorCompliance = function(color, context) {
  if (!this.designSystem.paintStyles) {
    return { isCompliant: true };
  }

  var suggestion = this.findIntelligentColorSuggestion(color, context);

  if (!suggestion.style) {
    return {
      isCompliant: true,
      reasoning: 'No appropriate design system color found'
    };
  }

  var distance = this.colorDistance(color, suggestion.style.paints[0].color);
  var isCompliant = distance <= this.tolerance;

  if (isCompliant) {
    return { isCompliant: true };
  }

  var severity = 'medium';
  if (context.isPrimary || context.isButton || context.isAlert) {
    severity = 'high';
  } else if (context.isBackground && distance > 0.3) {
    severity = 'high';
  } else if (distance < 0.2) {
    severity = 'low';
  }

  return {
    isCompliant: false,
    suggestion: {
      name: suggestion.style.name,
      color: suggestion.style.paints[0].color
    },
    confidence: suggestion.confidence,
    severity: severity,
    contextDescription: this.getContextDescription(context),
    reasoning: suggestion.reasoning
  };
};

// Intelligent color suggestion
DesignSystemAuditor.prototype.findIntelligentColorSuggestion = function(targetColor, context) {
  var themeMode = this.detectThemeMode(targetColor, context);
  var elementPurpose = this.detectElementPurpose(context);

  console.log('🎨 Color analysis: ' + elementPurpose + ' in ' + themeMode + ' mode');

  var appropriateColors = this.getAppropriateColorsForElement(elementPurpose, themeMode);

  if (appropriateColors.length === 0) {
    return { style: null, confidence: 0, reasoning: 'No appropriate colors found' };
  }

  var bestMatch = this.findBestColorMatch(targetColor, appropriateColors);

  if (bestMatch) {
    return {
      style: bestMatch.style,
      confidence: bestMatch.confidence,
      reasoning: elementPurpose + ' color in ' + themeMode + ' mode → ' + bestMatch.style.name
    };
  }

  return { style: null, confidence: 0, reasoning: 'No good match found' };
};

// Helper methods (implementing key functionality)
DesignSystemAuditor.prototype.isCompositeComponent = function(node) {
  var nodeName = (node.name || '').toLowerCase();
  var compositeTypes = [
    'header', 'footer', 'nav', 'navigation', 'sidebar', 'aside',
    'hero', 'banner', 'section', 'article', 'content',
    'form', 'login', 'signup', 'profile', 'dashboard',
    'list', 'grid', 'table', 'gallery'
  ];

  for (var i = 0; i < compositeTypes.length; i++) {
    if (nodeName.includes(compositeTypes[i])) {
      return {
        isComposite: true,
        type: compositeTypes[i],
        confidence: 80
      };
    }
  }

  if (node.type === 'FRAME' && node.children && node.children.length >= 3) {
    var childTypes = new Set();
    for (var i = 0; i < node.children.length; i++) {
      childTypes.add(node.children[i].type);
    }
    if (childTypes.size >= 2) {
      return {
        isComposite: true,
        type: 'composite',
        confidence: 60
      };
    }
  }

  return { isComposite: false };
};

DesignSystemAuditor.prototype.designSystemHasComponentType = function(componentType) {
  return this.customComponentRegistry.has(componentType) &&
         this.customComponentRegistry.get(componentType).size > 0;
};

DesignSystemAuditor.prototype.findMatchingDSComponent = function(node, componentType) {
  var dsComponents = this.customComponentRegistry.get(componentType);
  if (!dsComponents) return null;

  var firstComponent = Array.from(dsComponents)[0];
  return {
    name: firstComponent.name,
    id: firstComponent.id,
    similarity: 85
  };
};

DesignSystemAuditor.prototype.detectSpecificComponent = function(node, componentType) {
  var detectors = {
    'button': this.detectButton,
    'input': this.detectInput,
    'checkbox': this.detectCheckbox,
    'radio': this.detectRadioButton,
    'searchbox': this.detectSearchBox
  };

  var detector = detectors[componentType];
  if (detector) {
    var result = detector.call(this, node);
    return {
      isComponent: result.type === componentType,
      confidence: result.confidence
    };
  }

  return { isComponent: false, confidence: 0 };
};

// Utility methods (implementing essential functionality)
DesignSystemAuditor.prototype.getDesignSystemStats = function() {
  if (!this.designSystem) return { total: 0 };

  return {
    total: (this.designSystem.paintStyles && this.designSystem.paintStyles.length || 0) +
           (this.designSystem.textStyles && this.designSystem.textStyles.length || 0) +
           (this.designSystem.effectStyles && this.designSystem.effectStyles.length || 0),
    colors: this.designSystem.paintStyles && this.designSystem.paintStyles.length || 0,
    typography: this.designSystem.textStyles && this.designSystem.textStyles.length || 0,
    effects: this.designSystem.effectStyles && this.designSystem.effectStyles.length || 0,
    components: this.designSystem.components && this.designSystem.components.length || 0
  };
};

DesignSystemAuditor.prototype.buildTextStyleMap = function() {
  if (!this.designSystem.textStyles) return;

  this.textStyleMap.clear();

  for (var i = 0; i < this.designSystem.textStyles.length; i++) {
    var textStyle = this.designSystem.textStyles[i];
    if (textStyle.style) {
      var key = this.createTextStyleKey(textStyle.style);
      this.textStyleMap.set(key, textStyle);
    }
  }
};

DesignSystemAuditor.prototype.buildComponentMap = function() {
  if (!this.designSystem.components) return;

  this.componentMap.clear();

  for (var i = 0; i < this.designSystem.components.length; i++) {
    var component = this.designSystem.components[i];
    var componentType = this.getComponentType(component);
    if (!this.componentMap.has(componentType)) {
      this.componentMap.set(componentType, []);
    }
    this.componentMap.get(componentType).push(component);
  }
};

DesignSystemAuditor.prototype.createTextStyleKey = function(style) {
  var fontFamily = style.fontFamily || 'Unknown';
  var fontSize = style.fontSize || 16;
  var fontWeight = style.fontWeight || 'Regular';
  return fontFamily + '-' + fontSize + '-' + fontWeight;
};

DesignSystemAuditor.prototype.getComponentType = function(component) {
  var name = (component.name || '').toLowerCase();

  if (name.includes('button')) return 'button';
  if (name.includes('card')) return 'card';
  if (name.includes('input')) return 'input';
  if (name.includes('tag') || name.includes('chip')) return 'tag';
  if (name.includes('modal')) return 'modal';
  if (name.includes('tooltip')) return 'tooltip';
  if (name.includes('checkbox')) return 'checkbox';
  if (name.includes('radio')) return 'radio';
  if (name.includes('search')) return 'searchbox';

  return 'other';
};

DesignSystemAuditor.prototype.auditSelection = function(nodes) {
  var issues = [];

  if (!this.designSystem) {
    return [{
      type: 'error',
      message: 'No design system loaded',
      autoFixable: false
    }];
  }

  console.log('🔍 Starting intelligent audit of ' + nodes.length + ' nodes...');

  for (var i = 0; i < nodes.length; i++) {
    try {
      var nodeIssues = this.analyzeNode(nodes[i]);
      issues = issues.concat(nodeIssues);
    } catch (error) {
      console.error('Error analyzing node:', nodes[i].name, error);
      issues.push({
        type: 'error',
        message: 'Error analyzing "' + nodes[i].name + '": ' + error.message,
        node: nodes[i],
        autoFixable: false
      });
    }
  }

  console.log('✅ Intelligent analysis complete: ' + issues.length + ' issues found');
  return this.prioritizeIssues(issues);
};

DesignSystemAuditor.prototype.prioritizeIssues = function(issues) {
  var severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };

  return issues.sort(function(a, b) {
    var severityA = severityOrder[a.severity] || 0;
    var severityB = severityOrder[b.severity] || 0;

    if (severityA !== severityB) {
      return severityB - severityA;
    }

    var typeOrder = {
      'ds-duplication': 4,
      'component-replacement': 3,
      'composite-compliance': 2,
      'color': 1,
      'typography': 1
    };

    var typeA = typeOrder[a.type] || 0;
    var typeB = typeOrder[b.type] || 0;

    return typeB - typeA;
  });
};

DesignSystemAuditor.prototype.getNodePath = function(node) {
  var path = [];
  var current = node;

  while (current) {
    path.unshift(current.name || current.type);
    current = current.parent;
  }

  return path.join(' > ');
};

// Helper utility functions
DesignSystemAuditor.prototype.hasTextChild = function(node) {
  if (node.type === 'TEXT') return true;
  if (!node.children) return false;

  for (var i = 0; i < node.children.length; i++) {
    if (node.children[i].type === 'TEXT' || this.hasTextChild(node.children[i])) {
      return true;
    }
  }
  return false;
};

DesignSystemAuditor.prototype.hasIconChild = function(node) {
  if (!node.children) return false;

  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    var childName = (child.name || '').toLowerCase();
    if (childName.includes('icon') || childName.includes('svg') ||
        (child.type === 'VECTOR' || child.type === 'BOOLEAN_OPERATION')) {
      return true;
    }
  }
  return false;
};

DesignSystemAuditor.prototype.getTextContent = function(node) {
  if (node.type === 'TEXT') {
    return node.characters || '';
  }

  if (!node.children) return '';

  var content = '';
  for (var i = 0; i < node.children.length; i++) {
    var childContent = this.getTextContent(node.children[i]);
    if (childContent.length > 0) {
      content += (content ? ' ' : '') + childContent;
    }
  }
  return content;
};

DesignSystemAuditor.prototype.detectButtonVariant = function(node) {
  var nodeName = (node.name || '').toLowerCase();

  if (nodeName.includes('primary')) return 'primary';
  if (nodeName.includes('secondary')) return 'secondary';
  if (nodeName.includes('tertiary')) return 'tertiary';
  if (nodeName.includes('ghost') || nodeName.includes('text')) return 'ghost';
  if (nodeName.includes('danger') || nodeName.includes('destructive')) return 'danger';
  if (nodeName.includes('success')) return 'success';

  var hasStrongBackground = this.hasStrongBackgroundFill(node);
  var hasBorder = this.hasVisibleStroke(node);

  if (hasStrongBackground && !hasBorder) return 'primary';
  if (!hasStrongBackground && hasBorder) return 'secondary';
  if (!hasStrongBackground && !hasBorder) return 'ghost';

  return 'primary';
};

DesignSystemAuditor.prototype.detectButtonSize = function(node) {
  var height = node.height;

  if (height <= 32) return 'small';
  if (height <= 48) return 'medium';
  if (height <= 64) return 'large';
  return 'extra-large';
};

DesignSystemAuditor.prototype.getSuggestedButtonComponent = function(properties) {
  var variant = properties.variant;
  var size = properties.size;
  var hasIcon = properties.hasIcon;

  var component = 'Button/' + variant.charAt(0).toUpperCase() + variant.slice(1);

  if (size !== 'medium') {
    component += '/' + size.charAt(0).toUpperCase() + size.slice(1);
  }

  if (hasIcon) {
    component += '/WithIcon';
  }

  return component;
};

DesignSystemAuditor.prototype.isUsingDesignSystemComponent = function(node, componentType) {
  if (node.type === 'INSTANCE' && node.mainComponent) {
    var componentName = (node.mainComponent.name || '').toLowerCase();
    return componentName.includes(componentType);
  }

  var nodeName = (node.name || '').toLowerCase();
  var dsPatterns = [
    'ds/', 'ds-', 'design-system/', 'ui-', 'component/', 'lib/', 'system/'
  ];

  for (var i = 0; i < dsPatterns.length; i++) {
    if (nodeName.includes(dsPatterns[i]) && nodeName.includes(componentType)) {
      return true;
    }
  }
  return false;
};

DesignSystemAuditor.prototype.isDesignSystemComponent = function(node) {
  if (node.type === 'INSTANCE' && node.mainComponent) {
    var componentName = (node.mainComponent.name || '').toLowerCase();
    var dsPatterns = ['ds-', 'design-system', 'ui-', 'component'];
    for (var i = 0; i < dsPatterns.length; i++) {
      if (componentName.includes(dsPatterns[i])) return true;
    }
  }

  var nodeName = (node.name || '').toLowerCase();
  var dsPatterns = ['ds-', 'design-system', 'ui-', 'component'];
  for (var i = 0; i < dsPatterns.length; i++) {
    if (nodeName.includes(dsPatterns[i])) return true;
  }
  return false;
};

DesignSystemAuditor.prototype.colorDistance = function(color1, color2) {
  var dr = color1.r - color2.r;
  var dg = color1.g - color2.g;
  var db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

DesignSystemAuditor.prototype.getContextDescription = function(context) {
  var contexts = [];
  if (context.isHeading) contexts.push('heading');
  if (context.isButton) contexts.push('button');
  if (context.isLabel) contexts.push('label');
  if (context.isBackground) contexts.push('background');
  if (context.isCard) contexts.push('card');
  if (context.isFrame) contexts.push('frame');
  if (context.isError) contexts.push('error');
  if (context.isSuccess) contexts.push('success');
  if (context.isPrimary) contexts.push('primary');
  return contexts.length > 0 ? contexts.join(', ') : 'unknown';
};

DesignSystemAuditor.prototype.detectThemeMode = function(color, context) {
  var brightness = (color.r + color.g + color.b) / 3;

  if (context.isBackground || context.isCard || context.isFrame) {
    return brightness > 0.5 ? 'light' : 'dark';
  }

  if (context.isText || context.isHeading || context.isLabel) {
    return brightness < 0.5 ? 'light' : 'dark';
  }

  return brightness > 0.5 ? 'light' : 'dark';
};

DesignSystemAuditor.prototype.detectElementPurpose = function(context) {
  if (context.isError) return 'error';
  if (context.isSuccess) return 'success';
  if (context.isInfo) return 'info';
  if (context.isPrimary || context.isButton) return 'primary';
  if (context.isSecondary) return 'secondary';
  if (context.isText || context.isHeading || context.isLabel) return 'text';
  if (context.isBackground || context.isCard || context.isFrame) return 'background';
  return 'neutral';
};

DesignSystemAuditor.prototype.getAppropriateColorsForElement = function(purpose, themeMode) {
  var self = this;
  if (!this.designSystem.paintStyles) return [];

  return this.designSystem.paintStyles.filter(function(style) {
    var styleName = style.name.toLowerCase();
    var color = style.paints[0] && style.paints[0].color;
    if (!color) return false;

    if (purpose === 'text' && !self.isTextStyle(styleName)) return false;
    if (purpose === 'background' && !self.isBackgroundStyle(styleName)) return false;
    if (purpose === 'primary' && !self.isAccentStyle(styleName)) return false;

    return self.isThemeCompatible(style, themeMode === 'light');
  });
};

DesignSystemAuditor.prototype.findBestColorMatch = function(targetColor, colors) {
  if (colors.length === 0) return null;

  var bestMatch = null;
  var bestDistance = Infinity;

  for (var i = 0; i < colors.length; i++) {
    var style = colors[i];
    var distance = this.colorDistance(targetColor, style.paints[0].color);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = { style: style, confidence: Math.max(0, 100 - distance * 100) };
    }
  }

  return bestMatch;
};

DesignSystemAuditor.prototype.isTextStyle = function(styleName) {
  return styleName.includes('text') ||
         styleName.includes('foreground') ||
         styleName.includes('heading') ||
         styleName.includes('body');
};

DesignSystemAuditor.prototype.isBackgroundStyle = function(styleName) {
  return styleName.includes('bg') ||
         styleName.includes('background') ||
         styleName.includes('surface');
};

DesignSystemAuditor.prototype.isAccentStyle = function(styleName) {
  return styleName.includes('primary') ||
         styleName.includes('accent') ||
         styleName.includes('brand');
};

DesignSystemAuditor.prototype.isThemeCompatible = function(style, isLightMode) {
  var styleName = style.name.toLowerCase();
  var color = style.paints[0].color;
  var brightness = (color.r + color.g + color.b) / 3;

  if (styleName.includes('light') && !styleName.includes('dark')) {
    return isLightMode;
  }
  if (styleName.includes('dark') && !styleName.includes('light')) {
    return !isLightMode;
  }

  if (styleName.includes('bg') || styleName.includes('background') || styleName.includes('neutral')) {
    if (isLightMode) {
      return brightness > 0.4;
    } else {
      return brightness < 0.6;
    }
  }

  if (styleName.includes('text') || styleName.includes('foreground')) {
    if (isLightMode) {
      return brightness < 0.6;
    } else {
      return brightness > 0.4;
    }
  }

  return true;
};

DesignSystemAuditor.prototype.getNodeDepth = function(node) {
  var depth = 0;
  var current = node.parent;
  while (current) {
    depth++;
    current = current.parent;
  }
  return depth;
};

// Stub implementations for missing methods
DesignSystemAuditor.prototype.normalizeColorForComparison = function(paintStyle) {
  if (!paintStyle.paints || !paintStyle.paints[0] || !paintStyle.paints[0].color) {
    return null;
  }

  var color = paintStyle.paints[0].color;
  return {
    r: Math.round(color.r * 255),
    g: Math.round(color.g * 255),
    b: Math.round(color.b * 255)
  };
};

DesignSystemAuditor.prototype.normalizeTypographyForComparison = function(textStyle) {
  if (!textStyle.style) return null;

  return {
    fontFamily: textStyle.style.fontFamily || 'Unknown',
    fontSize: textStyle.style.fontSize || 16,
    fontWeight: textStyle.style.fontWeight || 'Regular'
  };
};

DesignSystemAuditor.prototype.normalizeEffectForComparison = function(effectStyle) {
  if (!effectStyle.effects || !effectStyle.effects[0]) return null;

  var effect = effectStyle.effects[0];
  return {
    type: effect.type,
    radius: effect.radius || 0,
    offset: effect.offset || { x: 0, y: 0 }
  };
};

DesignSystemAuditor.prototype.getAtomicComponentCount = function() {
  var count = 0;
  if (this.designSystem.paintStyles) count += this.designSystem.paintStyles.length;
  if (this.designSystem.textStyles) count += this.designSystem.textStyles.length;
  if (this.designSystem.effectStyles) count += this.designSystem.effectStyles.length;
  return count;
};

DesignSystemAuditor.prototype.getPatternCount = function() {
  return this.dsAtomPatterns.size;
};

DesignSystemAuditor.prototype.getComponentSeverity = function(componentType) {
  var highSeverityComponents = ['button', 'input', 'checkbox', 'radio'];
  return highSeverityComponents.includes(componentType) ? 'high' : 'medium';
};

DesignSystemAuditor.prototype.detectPatternsInNode = function(node) {
  return [];
};

DesignSystemAuditor.prototype.analyzeCompositeAtomicUsage = function(node) {
  return {
    totalElements: 0,
    compliantElements: 0,
    nonCompliantAtoms: 0,
    violations: [],
    complianceScore: 100,
    recommendations: []
  };
};

DesignSystemAuditor.prototype.analyzeSmartTypographyCompliance = function(node, currentPath) {
  return [];
};

DesignSystemAuditor.prototype.analyzeEffectCompliance = function(node, currentPath) {
  return [];
};

DesignSystemAuditor.prototype.analyzeSpacingCompliance = function(node, currentPath) {
  return [];
};

DesignSystemAuditor.prototype.hasCheckmarkIndicator = function(node) {
  if (!node.children) return false;
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    var childName = (child.name || '').toLowerCase();
    if (childName.includes('check') || childName.includes('tick') || child.type === 'VECTOR') {
      return true;
    }
  }
  return false;
};

DesignSystemAuditor.prototype.hasRadioIndicator = function(node) {
  if (!node.children) return false;
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    var childName = (child.name || '').toLowerCase();
    if (childName.includes('dot') || childName.includes('selected') ||
        (child.type === 'ELLIPSE' && child.width < node.width / 2)) {
      return true;
    }
  }
  return false;
};

DesignSystemAuditor.prototype.hasAdjacentLabel = function(node) {
  if (!node.parent || !node.parent.children) return false;

  var siblings = node.parent.children;
  var nodeIndex = siblings.indexOf(node);

  for (var i = 0; i < siblings.length; i++) {
    if (siblings[i].type === 'TEXT' && Math.abs(i - nodeIndex) <= 1) {
      return true;
    }
  }
  return false;
};

DesignSystemAuditor.prototype.hasSearchIcon = function(node) {
  if (!node.children) return false;
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    var childName = (child.name || '').toLowerCase();
    if (childName.includes('search') || childName.includes('magnify') ||
        (child.type === 'VECTOR' && this.looksLikeSearchIcon(child))) {
      return true;
    }
  }
  return false;
};

DesignSystemAuditor.prototype.hasSearchButton = function(node) {
  if (!node.children) return false;
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    var childName = (child.name || '').toLowerCase();
    if (childName.includes('search') &&
        (childName.includes('button') || childName.includes('btn'))) {
      return true;
    }
  }
  return false;
};

DesignSystemAuditor.prototype.looksLikeSearchIcon = function(vectorNode) {
  return vectorNode.width <= 24 && vectorNode.height <= 24 &&
         Math.abs(vectorNode.width - vectorNode.height) <= 4;
};

DesignSystemAuditor.prototype.isInInteractiveContext = function(node) {
  if (!node.parent) return false;

  var parentName = (node.parent.name || '').toLowerCase();
  var interactiveContexts = [
    'toolbar', 'actions', 'controls', 'buttons', 'form', 'nav', 'menu',
    'header', 'footer', 'sidebar', 'controls', 'interface'
  ];

  for (var i = 0; i < interactiveContexts.length; i++) {
    if (parentName.includes(interactiveContexts[i])) return true;
  }
  return false;
};

DesignSystemAuditor.prototype.hasStateVariations = function(node) {
  if (!node.parent || !node.parent.children) return false;

  var siblings = node.parent.children;
  var nodeName = (node.name || '').toLowerCase();
  var baseNodeName = nodeName.replace(/[_\-\s](hover|pressed|active|disabled|focus|selected)/g, '');

  var stateKeywords = ['hover', 'pressed', 'active', 'disabled', 'focus', 'selected'];

  for (var i = 0; i < siblings.length; i++) {
    var sibling = siblings[i];
    if (sibling === node) continue;

    var siblingName = (sibling.name || '').toLowerCase();
    var siblingBaseName = siblingName.replace(/[_\-\s](hover|pressed|active|disabled|focus|selected)/g, '');

    if (siblingBaseName === baseNodeName) {
      for (var j = 0; j < stateKeywords.length; j++) {
        if (siblingName.includes(stateKeywords[j])) {
          return true;
        }
      }
    }
  }
  return false;
};

DesignSystemAuditor.prototype.hasStrongBackgroundFill = function(node) {
  if (!node.fills) return false;

  for (var i = 0; i < node.fills.length; i++) {
    var fill = node.fills[i];
    if (fill.visible === false || !fill.color) continue;
    var brightness = (fill.color.r + fill.color.g + fill.color.b) / 3;
    if (brightness < 0.8 && brightness > 0.1 && (fill.opacity || 1) > 0.5) {
      return true;
    }
  }
  return false;
};

DesignSystemAuditor.prototype.hasVisibleStroke = function(node) {
  if (!node.strokes) return false;

  for (var i = 0; i < node.strokes.length; i++) {
    var stroke = node.strokes[i];
    if (stroke.visible !== false && (stroke.opacity || 1) > 0) {
      return true;
    }
  }
  return false;
};

// Figma plugin message handler
figma.ui.onmessage = function(msg) {
  try {
    var auditor = new DesignSystemAuditor();

    switch (msg.type) {
      case 'load-design-system':
        // FIXED: Now accepts the JSON data from the UI instead of extracting from Figma
        var loadResult = auditor.loadDesignSystemFromJSON(msg.designSystem);
        if (loadResult.success) {
          figma.ui.postMessage({
            type: 'design-system-loaded',
            metadata: loadResult.metadata,
            stats: loadResult.stats
          });
          figma.notify('Design system loaded successfully!');
        } else {
          figma.ui.postMessage({
            type: 'design-system-error',
            error: loadResult.error
          });
          figma.notify('Error loading design system');
        }
        break;

      case 'scan-selection':
        var selection = figma.currentPage.selection;
        if (selection.length === 0) {
          figma.notify('Please select some elements to audit');
          return;
        }

        var selectionIssues = auditor.auditSelection(selection);
        figma.ui.postMessage({
          type: 'scan-results',
          issues: selectionIssues
        });
        break;

      case 'scan-full-page':
        var allNodes = figma.currentPage.children;
        var allIssues = auditor.auditSelection(allNodes);
        figma.ui.postMessage({
          type: 'scan-results',
          issues: allIssues
        });
        break;

      case 'apply-fix':
        for (var i = 0; i < msg.issues.length; i++) {
          var issue = msg.issues[i];
          if (issue.autoFixable && issue.nodeId) {
            var node = figma.getNodeById(issue.nodeId);
            if (node) {
              if (issue.type === 'color' && issue.suggestedColor) {
                if (node.fills) {
                  var newFills = node.fills.slice();
                  if (newFills[0] && newFills[0].type === 'SOLID') {
                    newFills[0].color = issue.suggestedColor;
                    node.fills = newFills;
                  }
                }
              }
            }
          }
        }
        figma.notify('Applied ' + msg.issues.length + ' fixes');
        break;

      case 'select-node':
        if (msg.nodeId) {
          var node = figma.getNodeById(msg.nodeId);
          if (node) {
            figma.currentPage.selection = [node];
            figma.viewport.scrollAndZoomIntoView([node]);
          }
        }
        break;

      default:
        console.log('Unknown message type:', msg.type);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    figma.notify('An error occurred: ' + error.message);
  }
};

// Send initial selection state
figma.on('selectionchange', function() {
  var selection = figma.currentPage.selection;
  figma.ui.postMessage({
    type: 'selection-changed',
    selection: selection.map(function(node) {
      return node.name;
    })
  });
});

// FIXED: Initialize UI with correct dimensions matching the HTML (520x700)
figma.showUI(__html__, { width: 520, height: 700 });

console.log('Design System Auditor plugin loaded');
