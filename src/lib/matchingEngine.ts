import { Property, Requirement, PropertyMatchResult } from '../types';

export function matchPropertiesForRequirement(
  requirement: Requirement,
  properties: Property[]
): PropertyMatchResult[] {
  const results: PropertyMatchResult[] = [];

  for (const property of properties) {
    const matchReasons: string[] = [];
    const missingDataNotes: string[] = [];
    let hardConstraintsMet = true;

    // 1. Transaction & Property Type compatibility check
    const reqType = requirement.propertyType.toLowerCase();
    const propType = property.propertyType.toLowerCase();
    const typesMatch = propType.includes(reqType) || reqType.includes(propType);

    if (!typesMatch) {
      hardConstraintsMet = false;
      continue;
    }

    // 2. Excluded locations check (Deal breaker)
    const propLoc = (property.location + ' ' + property.area).toLowerCase();
    const isExcluded = requirement.excludedLocations?.some((ex) =>
      propLoc.includes(ex.toLowerCase().trim())
    );
    if (isExcluded) {
      hardConstraintsMet = false;
      continue;
    }

    // 3. Budget upper bound check with 10% flexible negotiation tolerance
    const budgetMax = requirement.budgetMax || 0;
    if (budgetMax > 0 && property.priceAmount > budgetMax * 1.15) {
      hardConstraintsMet = false;
      continue;
    }

    // 4. Size requirement check
    if (requirement.minSizeSqm && property.sizeSqm < requirement.minSizeSqm * 0.85) {
      hardConstraintsMet = false;
      continue;
    }

    // Calculate weighted score
    let score = 40; // Base baseline for passing hard filters

    // A. Location matching (30 points)
    const matchesPreferred = requirement.preferredLocations?.some((loc) =>
      propLoc.includes(loc.toLowerCase().trim())
    );
    if (matchesPreferred) {
      score += 30;
      matchReasons.push(`Exact location fit in ${property.location}`);
    } else {
      score += 10;
      matchReasons.push(`Alternative location in ${property.area} (${property.city})`);
    }

    // B. Budget fit (20 points)
    if (budgetMax > 0) {
      if (property.priceAmount <= budgetMax) {
        score += 20;
        matchReasons.push(`Within specified budget (${property.priceDisplay} vs max ${requirement.budgetDisplay})`);
      } else {
        score += 8;
        matchReasons.push(`Slightly above budget (${property.priceDisplay}), negotiable within range`);
      }
    } else {
      missingDataNotes.push('Client budget max is open-ended');
    }

    // C. Size fit (10 points)
    if (requirement.minSizeSqm) {
      if (property.sizeSqm >= requirement.minSizeSqm) {
        score += 10;
        matchReasons.push(`Area matches requirement (${property.sizeSqm} sqm available)`);
      }
    }

    // D. Amenities & Essential features check
    if (requirement.essentialFeatures && requirement.essentialFeatures.length > 0) {
      let matchedCount = 0;
      const propFeatures = (property.specifications + ' ' + property.amenities.join(' ')).toLowerCase();
      
      for (const feat of requirement.essentialFeatures) {
        if (propFeatures.includes(feat.toLowerCase().trim())) {
          matchedCount++;
        } else {
          missingDataNotes.push(`Verification needed for: ${feat}`);
        }
      }
      if (matchedCount > 0) {
        matchReasons.push(`Matches essential features (${matchedCount}/${requirement.essentialFeatures.length})`);
      }
    }

    // Ensure score is capped at 98% (realistic matching)
    score = Math.min(score, 98);

    results.push({
      property,
      score,
      hardConstraintsMet,
      matchReasons,
      missingDataNotes,
    });
  }

  // Sort by highest match score
  return results.sort((a, b) => b.score - a.score);
}
