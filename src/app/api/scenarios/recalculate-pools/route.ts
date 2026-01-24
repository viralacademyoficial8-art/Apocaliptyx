// API endpoint to recalculate all scenario pools based on actual votes
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = getSupabaseClient();

    // Get all active scenarios
    const { data: scenarios, error: scenariosError } = await supabase
      .from('scenarios')
      .select('id')
      .eq('status', 'ACTIVE');

    if (scenariosError) {
      return NextResponse.json({ error: scenariosError.message }, { status: 500 });
    }

    if (!scenarios || scenarios.length === 0) {
      return NextResponse.json({ message: 'No scenarios to update', updated: 0 });
    }

    let updatedCount = 0;

    // For each scenario, recalculate the pools
    for (const scenario of scenarios) {
      // Get all predictions for this scenario
      const { data: predictions, error: predictionsError } = await supabase
        .from('predictions')
        .select('prediction, amount')
        .eq('scenario_id', scenario.id);

      if (predictionsError || !predictions) {
        continue;
      }

      // Calculate pools - count votes if all amounts are 0
      const hasAmounts = predictions.some((p) => (p.amount || 0) > 0);

      let yesPool = 0;
      let noPool = 0;

      predictions.forEach((p) => {
        const value = hasAmounts ? (p.amount || 0) : 1;

        if (p.prediction === 'YES') {
          yesPool += value;
        } else if (p.prediction === 'NO') {
          noPool += value;
        }
      });

      const totalPool = yesPool + noPool;

      // Update the scenario
      const { error: updateError } = await supabase
        .from('scenarios')
        .update({
          yes_pool: yesPool,
          no_pool: noPool,
          total_pool: totalPool,
          participant_count: predictions.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', scenario.id);

      if (!updateError) {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Recalculated pools for ${updatedCount} scenarios`,
      updated: updatedCount,
      total: scenarios.length,
    });
  } catch (error) {
    console.error('Error recalculating pools:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
