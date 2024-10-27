#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;
use states::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod solanalottery {

    use super::*;

    pub fn initialize_config(
        _ctx: Context<InitializeConfig>,
        lottery_id: u64,
        start: u64,
        end: u64,
        price: u64,
    ) -> Result<()> {
        instructions::initialize_config(_ctx, lottery_id, start, end, price)?;
        Ok(())
    }
}
